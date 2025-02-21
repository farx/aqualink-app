import { Logger } from '@nestjs/common';
import axios, { AxiosPromise } from 'axios';
import { Dictionary } from 'lodash';
import { Connection, IsNull, Not } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { sendSlackMessage, SlackMessage } from '../utils/slack.utils';
import { getYouTubeVideoId } from '../utils/urls';

const logger = new Logger('CheckVideoStreams');

type siteIdToVideoStreamDetails = Record<
  number,
  {
    id?: string;
    name: string | null;
    siteId: number;
    url: string;
    error: string;
  }
>;

// Create a basic structure for youTube response items
interface YouTubeVideoItem {
  id: string;
  status: {
    privacyStatus: 'private' | 'public' | 'unlisted';
    embeddable: boolean;
    uploadStatus: 'deleted' | 'failed' | 'processed' | 'rejected' | 'uploaded';
  };
  liveStreamingDetails: {
    actualStartTime: string;
    actualEndTime: string;
  };
}

interface YouTubeApiResponse {
  items: YouTubeVideoItem[];
}

const getSiteFrontEndURL = (siteId: number, frontUrl: string) =>
  new URL(`sites/${siteId}`, frontUrl).href;

export const fetchVideoDetails = (
  youTubeIds: string[],
  apiKey: string,
): AxiosPromise<YouTubeApiResponse> => {
  return axios({
    url: 'https://www.googleapis.com/youtube/v3/videos',
    method: 'get',
    params: {
      key: apiKey,
      id: youTubeIds.join(),
      part: 'status,liveStreamingDetails',
    },
  });
};

export const getErrorMessage = (item: YouTubeVideoItem) => {
  const { uploadStatus, privacyStatus, embeddable } = item.status;

  if (privacyStatus === 'private') {
    return 'Video is not public';
  }

  if (uploadStatus !== 'uploaded' && uploadStatus !== 'processed') {
    return 'Video is no longer available';
  }

  if (!embeddable) {
    return 'Video is not embeddable';
  }

  if (!item.liveStreamingDetails) {
    return 'Video is not a live stream';
  }

  if (item.liveStreamingDetails.actualEndTime) {
    return 'The live stream has ended';
  }

  if (!item.liveStreamingDetails.actualStartTime) {
    return 'The live stream has not started yet';
  }

  return '';
};

const checkVideoOptions = (youTubeVideoItems: YouTubeVideoItem[]) =>
  youTubeVideoItems.reduce<Dictionary<string>>((mapping, item) => {
    return {
      ...mapping,
      [item.id]: getErrorMessage(item),
    };
  }, {});

export const checkVideoStreams = async (
  connection: Connection,
  projectId: string,
) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const slackChannel = process.env.SLACK_BOT_CHANNEL;
  const frontUrl = process.env.FRONT_END_BASE_URL;

  // Check that the all necessary environment variables are set
  if (!apiKey) {
    logger.error('No google api key was defined');
    return;
  }

  if (!slackToken) {
    logger.error('No slack bot token was defined');
    return;
  }

  if (!slackChannel) {
    logger.error('No slack target channel was defined');
    return;
  }

  if (!frontUrl) {
    logger.error('No front url was defined');
    return;
  }

  // Fetch sites with streams
  const sitesWithStream = await connection.getRepository(Site).find({
    where: { videoStream: Not(IsNull()) },
  });

  // Extract the youTube id from the URLs
  const siteIdToVideoStreamDetails =
    sitesWithStream.reduce<siteIdToVideoStreamDetails>((mapping, site) => {
      const id = getYouTubeVideoId(site.videoStream!);

      return {
        ...mapping,
        [site.id]: {
          id,
          name: site.name,
          siteId: site.id,
          url: site.videoStream!,
          // If no id exists, then url is invalid
          error: id ? '' : 'Video stream URL is invalid',
        },
      };
    }, {});

  const youTubeIds = Object.values(siteIdToVideoStreamDetails)
    .map((videoStreamDetails) => videoStreamDetails.id)
    .filter((id) => id) as string[];

  // Fetch the youTube video information for each id
  const axiosResponse = await fetchVideoDetails(youTubeIds, apiKey);

  // Validate that the streams are valid
  // For ids with no errors an empty string is returned
  const youTubeIdToError = checkVideoOptions(axiosResponse.data.items);

  const blocks = Object.values(siteIdToVideoStreamDetails).reduce<
    Exclude<SlackMessage['blocks'], undefined>
  >((msgs, { id, siteId, url, name, error }) => {
    const reportedError =
      error ||
      (!(id! in youTubeIdToError) && 'Video does not exist') ||
      youTubeIdToError[id!];

    if (!reportedError) {
      return msgs;
    }

    const template = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text:
          `*Site*: ${name} - ${getSiteFrontEndURL(siteId, frontUrl)}\n` +
          `*Video*: ${url}\n` +
          `*Error*: ${reportedError}`,
      },
    };

    return [...msgs, template];
  }, []);

  // No irregular video streams were found
  // So skip sending an alert on slack
  if (!blocks.length) {
    return;
  }

  // Create a simple alert template for slack
  const messageTemplate = {
    // The channel id is fetched by requesting the list on GET https://slack.com/api/conversations.list
    // (the auth token should be included in the auth headers)
    channel: slackChannel,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Scheduled check of video streams in *${projectId}* instance`,
        },
      },
      {
        type: 'divider',
      },
      ...blocks,
    ],
  } as SlackMessage;

  // Log message in stdout
  logger.log(messageTemplate);

  // Send an alert containing all irregular video stream along with the reason
  await sendSlackMessage(messageTemplate, slackToken);
};

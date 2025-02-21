import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Theme,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import reefImage from "../../../assets/reef-image.jpg";
import uploadIcon from "../../../assets/icon_upload.svg";
import { isAdmin } from "../../../helpers/user";
import { userInfoSelector } from "../../../store/User/userSlice";
import { convertOptionsToQueryParams } from "../../../helpers/video";

const playerOptions = {
  autoplay: 1,
  mute: 1,
  modestbranding: 1,
  playsinline: 1,
};

const FeaturedMedia = ({
  siteId,
  url,
  featuredImage,
  surveyId,
  classes,
}: FeaturedMediaProps) => {
  const user = useSelector(userInfoSelector);
  const isSiteAdmin = isAdmin(user, siteId);

  if (url) {
    return (
      <Card className={classes.card}>
        <CardContent className={classes.content}>
          <iframe
            className={classes.fullHeightAndWidth}
            title="live-video-stream"
            src={`${url}${convertOptionsToQueryParams(playerOptions)}`}
            allowFullScreen
          />
        </CardContent>
      </Card>
    );
  }

  if (featuredImage && surveyId) {
    return (
      <Link to={`/sites/${siteId}/survey_details/${surveyId}`}>
        <CardMedia
          className={classes.card}
          style={{ height: "100%" }}
          image={featuredImage}
        />
      </Link>
    );
  }

  return (
    <Card className={classes.card}>
      <div className={classes.noVideoCardHeader}>
        <Grid container direction="column" alignItems="center" spacing={2}>
          <Grid item>
            <Typography className={classes.noVideoCardHeaderText} variant="h5">
              {isSiteAdmin ? "ADD YOUR FIRST SURVEY" : "SURVEY TO BE UPLOADED"}
            </Typography>
          </Grid>
          {isSiteAdmin && (
            <Grid item>
              <IconButton component={Link} to={`/sites/${siteId}/new_survey`}>
                <img src={uploadIcon} alt="upload" />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </div>
      <div className={classes.noVideoCardContent} />
    </Card>
  );
};

const styles = (theme: Theme) => {
  return createStyles({
    card: {
      height: "100%",
      width: "100%",
      display: "flex",
      borderRadius: 4,
      position: "relative",
    },
    content: {
      height: "100%",
      width: "100%",
      padding: "0",
    },
    noVideoCardHeader: {
      backgroundColor: "#033042",
      opacity: 0.75,
      position: "absolute",
      top: 0,
      width: "100%",
      padding: "2rem 0",
      zIndex: 1,
    },
    noVideoCardHeaderText: {
      opacity: 0.5,
      [theme.breakpoints.between("md", 1350)]: {
        fontSize: 15,
      },
    },
    noVideoCardContent: {
      width: "100%",
      height: "100%",
      backgroundImage: `url(${reefImage})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      filter: "blur(2px)",
    },

    fullHeightAndWidth: {
      height: "100%",
      width: "100%",
    },
  });
};

interface FeaturedMediaIncomingProps {
  siteId: number;
  url?: string | null;
  featuredImage?: string | null;
  surveyId?: number | null;
}

FeaturedMedia.defaultProps = {
  url: null,
  featuredImage: null,
  surveyId: null,
};

type FeaturedMediaProps = WithStyles<typeof styles> &
  FeaturedMediaIncomingProps;

export default withStyles(styles)(FeaturedMedia);

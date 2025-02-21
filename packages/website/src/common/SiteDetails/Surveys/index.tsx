import React, { useState, useEffect, ChangeEvent } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  useTheme,
  useMediaQuery,
  Theme,
  Grid,
  Typography,
  Select,
  FormControl,
  MenuItem,
  Box,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import Timeline from "./Timeline";
import PointSelector from "./PointSelector";
import { setSiteSurveyPoints } from "../../../store/Sites/selectedSiteSlice";
import { userInfoSelector } from "../../../store/User/userSlice";
import {
  surveysRequest,
  updateSurveyPointName,
} from "../../../store/Survey/surveyListSlice";
import { setSelectedPoi } from "../../../store/Survey/surveySlice";
import observationOptions from "../../../constants/uploadDropdowns";
import { SurveyMedia } from "../../../store/Survey/types";
import siteServices from "../../../services/siteServices";
import { Site } from "../../../store/Sites/types";
import { isAdmin } from "../../../helpers/user";
import DeleteSurveyPointDialog, { Action } from "../../Dialog";
import { useBodyLength } from "../../../hooks/useBodyLength";
import surveyServices from "../../../services/surveyServices";
import { getAxiosErrorMessage } from "../../../helpers/errors";

const Surveys = ({ site, classes }: SurveysProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [point, setPoint] = useState<string>("All");
  const pointOptions = site.surveyPoints;
  const [deleteSurveyPointDialogOpen, setDeleteSurveyPointDialogOpen] =
    useState<boolean>(false);
  const [editSurveyPointNameDraft, seteditSurveyPointNameDraft] = useState<
    string | null
  >();
  const [editSurveyPointNameLoading, seteditSurveyPointNameLoading] =
    useState<boolean>(false);
  const [surveyPointToDelete, setSurveyPointToDelete] = useState<number | null>(
    null
  );
  const [isDeletePointLoading, setIsDeletePointLoading] = useState(false);
  const [deletePointError, setDeletePointError] = useState<string>();
  const [observation, setObservation] = useState<
    SurveyMedia["observations"] | "any"
  >("any");
  const user = useSelector(userInfoSelector);
  const isSiteAdmin = isAdmin(user, site.id);
  const dispatch = useDispatch();

  const bodyLength = useBodyLength();

  const surveyPointToDeleteName = pointOptions.find(
    ({ id }) => id === surveyPointToDelete
  )?.name;

  useEffect(() => {
    dispatch(setSelectedPoi(point));
  }, [dispatch, point]);

  const onDeleteSurveyPointButtonClick = (id: number) => {
    setDeleteSurveyPointDialogOpen(true);
    setSurveyPointToDelete(id);
  };

  const handlePointChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPoint(event.target.value as string);
  };

  const handleObservationChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setObservation(event.target.value as SurveyMedia["observations"] | "any");
  };

  const pointIdFinder = (name: string) => {
    return pointOptions.find((option) => option.name === name)?.id || -1;
  };

  const handleDeleteSurveyPointDialogClose = () => {
    setDeleteSurveyPointDialogOpen(false);
    setSurveyPointToDelete(null);
    setIsDeletePointLoading(false);
    setDeletePointError(undefined);
  };

  const handleSurveyPointDelete = async () => {
    if (typeof surveyPointToDelete === "number") {
      setIsDeletePointLoading(true);
      try {
        await siteServices.deleteSiteSurveyPoint(
          surveyPointToDelete,
          user?.token
        );

        dispatch(
          setSiteSurveyPoints(
            pointOptions.filter((option) => option.id !== surveyPointToDelete)
          )
        );
        dispatch(surveysRequest(`${site.id}`));
        setDeleteSurveyPointDialogOpen(false);
        setSurveyPointToDelete(null);
      } catch (error) {
        setDeletePointError(getAxiosErrorMessage(error));
      } finally {
        setIsDeletePointLoading(false);
      }
    }
  };

  const enableeditSurveyPointName = (id: number) => {
    const initialName = pointOptions.find((item) => item.id === id)?.name;
    seteditSurveyPointNameDraft(initialName);
  };

  const disableeditSurveyPointName = () =>
    seteditSurveyPointNameDraft(undefined);

  const onChangeSurveyPointName = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => seteditSurveyPointNameDraft(event.target.value);

  const submitSurveyPointNameUpdate = (key: number) => {
    const newName = editSurveyPointNameDraft;
    if (newName && user?.token) {
      seteditSurveyPointNameLoading(true);
      surveyServices
        .updatePoi(key, { name: newName }, user.token)
        .then(() => {
          // Update point name for featured image card
          dispatch(updateSurveyPointName({ id: key, name: newName }));

          // If the updated point was previously selected, update its value
          const prevName = pointOptions.find((item) => item.id === key)?.name;
          if (prevName === point) {
            setPoint(newName);
          }

          // Update point options
          dispatch(
            setSiteSurveyPoints(
              pointOptions.map((item) => {
                if (item.id === key) {
                  return {
                    ...item,
                    name: newName,
                  };
                }
                return item;
              })
            )
          );
          seteditSurveyPointNameDraft(undefined);
        })
        .catch(console.error)
        .finally(() => seteditSurveyPointNameLoading(false));
    }
  };

  const deleteSurveyPointDialogActions: Action[] = [
    {
      size: "small",
      variant: "contained",
      color: "secondary",
      text: "No",
      disabled: isDeletePointLoading,
      action: handleDeleteSurveyPointDialogClose,
    },
    {
      size: "small",
      variant: "contained",
      color: "primary",
      text: "Yes",
      loading: isDeletePointLoading,
      disabled: isDeletePointLoading,
      action: handleSurveyPointDelete,
    },
  ];

  return (
    <>
      <DeleteSurveyPointDialog
        open={deleteSurveyPointDialogOpen}
        onClose={handleDeleteSurveyPointDialogClose}
        error={deletePointError}
        header={`Delete ${surveyPointToDeleteName}`}
        content={
          <Typography color="textSecondary">
            Are you sure you want to delete this survey point? It will be
            deleted across all surveys.
          </Typography>
        }
        actions={deleteSurveyPointDialogActions}
      />
      <Grid className={classes.root} container justify="center" spacing={2}>
        <Box
          bgcolor="#f5f6f6"
          position="absolute"
          height="100%"
          width={bodyLength}
          zIndex="-1"
        />
        <Grid
          className={classes.surveyWrapper}
          container
          justify="space-between"
          item
          lg={12}
          xs={11}
          alignItems="baseline"
          spacing={isTablet ? 4 : 1}
        >
          <Grid
            container
            justify={isTablet ? "flex-start" : "center"}
            item
            md={12}
            lg={3}
          >
            <Typography className={classes.title}>Survey History</Typography>
          </Grid>
          <PointSelector
            siteId={site.id}
            pointOptions={pointOptions}
            point={point}
            pointId={pointIdFinder(point)}
            editSurveyPointNameDraft={editSurveyPointNameDraft}
            isSiteAdmin={isSiteAdmin}
            editSurveyPointNameLoading={editSurveyPointNameLoading}
            onChangeSurveyPointName={onChangeSurveyPointName}
            handlePointChange={handlePointChange}
            enableeditSurveyPointName={enableeditSurveyPointName}
            disableeditSurveyPointName={disableeditSurveyPointName}
            submitSurveyPointNameUpdate={submitSurveyPointNameUpdate}
            onDeleteButtonClick={onDeleteSurveyPointButtonClick}
          />
          <Grid
            container
            alignItems="center"
            justify={isTablet ? "flex-start" : "center"}
            item
            md={12}
            lg={4}
            spacing={1}
          >
            {/* TODO - Make observation a required field. */}
            <Grid item>
              <Typography variant="h6" className={classes.subTitle}>
                Observation:
              </Typography>
            </Grid>
            <Grid item className={classes.selectorWrapper}>
              <FormControl className={classes.formControl}>
                <Select
                  labelId="survey-observation"
                  id="survey-observation"
                  name="survey-observation"
                  value={observation}
                  onChange={handleObservationChange}
                  className={classes.selectedItem}
                  inputProps={{ className: classes.textField }}
                >
                  <MenuItem value="any">
                    <Typography className={classes.menuItem} variant="h6">
                      Any
                    </Typography>
                  </MenuItem>
                  {observationOptions.map((item) => (
                    <MenuItem
                      className={classes.menuItem}
                      value={item.key}
                      key={item.key}
                      title={item.value}
                    >
                      {item.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid container justify="center" item xs={11} lg={12}>
          <Timeline
            isAdmin={isSiteAdmin}
            addNewButton
            siteId={site.id}
            timeZone={site.timezone}
            observation={observation}
            pointName={point}
            pointId={pointIdFinder(point)}
          />
        </Grid>
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: "5rem",
      position: "relative",
    },
    surveyWrapper: {
      marginTop: "5rem",
    },
    title: {
      fontSize: 22,
      lineHeight: 1.45,
      color: "#2a2a2a",
      marginBottom: "1rem",
    },
    subTitle: {
      lineHeight: 1,
      color: "#474747",
      marginRight: "1rem",
    },
    selectorWrapper: {
      [theme.breakpoints.down("xs")]: {
        width: "100%",
      },
    },
    formControl: {
      minWidth: 120,
      maxWidth: 240,
    },
    selectedItem: {
      color: theme.palette.primary.main,
    },
    menuItem: {
      color: theme.palette.primary.main,
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    },
    textField: {
      width: "100%",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "block",
    },
  });

interface SurveyIncomingProps {
  site: Site;
}

type SurveysProps = SurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Surveys);

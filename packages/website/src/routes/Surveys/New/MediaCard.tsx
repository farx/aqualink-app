import React, { ChangeEvent, useState, useCallback } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Grid,
  Paper,
  Typography,
  IconButton,
  CardMedia,
  MenuItem,
  TextField,
  Button,
  Tooltip,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { DeleteOutlineOutlined } from "@material-ui/icons";

import classNames from "classnames";
import observationOptions from "../../../constants/uploadDropdowns";
import { SurveyPoints } from "../../../store/Sites/types";
import { ReactComponent as StarIcon } from "../../../assets/starIcon.svg";
import NewSurveyPointDialog from "../../../common/NewSurveyPointDialog";

const MediaCard = ({
  preview,
  surveyPoint,
  siteId,
  observation,
  comments,
  surveyPointOptions,
  index,
  file,
  featuredFile,
  handleSurveyPointOptionAdd,
  deleteCard,
  setFeatured,
  handleCommentsChange,
  handleObservationChange,
  handleSurveyPointChange,
  classes,
}: MediaCardProps) => {
  const size = (file && file.size && file.size / 1000000)?.toFixed(2);
  const [addSurveyPointDialogOpen, setAddSurveyPointDialogOpen] =
    useState<boolean>(false);

  const onImageClick = useCallback(() => {
    setFeatured(index);
  }, [index, setFeatured]);

  return (
    <>
      <NewSurveyPointDialog
        siteId={siteId}
        open={addSurveyPointDialogOpen}
        onClose={() => setAddSurveyPointDialogOpen(false)}
        onSuccess={handleSurveyPointOptionAdd}
      />
      <Grid style={{ marginTop: "2rem" }} container item xs={12}>
        <Paper elevation={0} className={classes.mediaCardWrapper}>
          <Grid
            style={{ height: "100%" }}
            container
            alignItems="center"
            justify="space-between"
            item
            xs={12}
          >
            <Grid style={{ height: "100%" }} item xs={3}>
              <CardMedia className={classes.cardImage} image={preview}>
                {size && (
                  <Grid
                    className={classes.mediaSizeWrapper}
                    container
                    item
                    xs={12}
                    alignItems="flex-end"
                    justify="flex-end"
                  >
                    <Grid
                      className={classes.mediaSize}
                      container
                      alignItems="center"
                      justify="center"
                      item
                      xs={3}
                    >
                      <Typography variant="subtitle2">{size} MB</Typography>
                    </Grid>
                  </Grid>
                )}
              </CardMedia>
            </Grid>
            <Grid container justify="center" item xs={3}>
              <Grid style={{ marginBottom: "1rem" }} item xs={10}>
                <Typography color="textSecondary" variant="h6">
                  Survey Point
                </Typography>
              </Grid>
              <Grid style={{ marginBottom: "2rem" }} item xs={10}>
                <TextField
                  className={classes.textField}
                  select
                  id="surveyPoint"
                  name="surveyPoint"
                  onChange={handleSurveyPointChange}
                  value={surveyPoint}
                  fullWidth
                  variant="outlined"
                  inputProps={{
                    className: classes.textField,
                  }}
                >
                  {surveyPointOptions.map((item) => (
                    <MenuItem
                      className={classNames(
                        classes.textField,
                        classes.menuItem
                      )}
                      value={item.id}
                      key={item.id}
                    >
                      {item.name}
                    </MenuItem>
                  ))}
                  <MenuItem className={classes.textField}>
                    <AddIcon />
                    <Button
                      style={{ color: "black" }}
                      onClick={() => setAddSurveyPointDialogOpen(true)}
                    >
                      Add new survey point
                    </Button>
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid style={{ marginBottom: "1rem" }} item xs={10}>
                <Typography color="textSecondary" variant="h6">
                  Observation
                </Typography>
              </Grid>
              <Grid style={{ marginBottom: "2rem" }} item xs={10}>
                <TextField
                  className={classes.textField}
                  select
                  id="observation"
                  name="observation"
                  onChange={handleObservationChange}
                  value={observation}
                  placeholder="Select One"
                  fullWidth
                  variant="outlined"
                  inputProps={{
                    className: classes.textField,
                  }}
                >
                  {observationOptions.map((item) => (
                    <MenuItem
                      className={classes.textField}
                      value={item.key}
                      key={item.key}
                    >
                      {item.value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container justify="center" item xs={5}>
              <Grid style={{ marginBottom: "1rem" }} item xs={12}>
                <Typography color="textSecondary" variant="h6">
                  Comments
                </Typography>
              </Grid>
              <Grid style={{ marginBottom: "2rem" }} item xs={12}>
                <TextField
                  className={classes.textField}
                  variant="outlined"
                  multiline
                  name="comments"
                  placeholder="Comments"
                  onChange={handleCommentsChange}
                  value={comments}
                  rows="8"
                  fullWidth
                  inputProps={{
                    className: classes.textField,
                  }}
                />
              </Grid>
            </Grid>
            <Grid style={{ height: "100%" }} container item xs={1}>
              <Grid
                container
                item
                alignContent="space-between"
                justify="flex-end"
                xs={12}
              >
                <IconButton onClick={onImageClick}>
                  <Tooltip
                    title={
                      index === featuredFile
                        ? "Featured image"
                        : "Set this image as featured"
                    }
                  >
                    <StarIcon
                      fill={index === featuredFile ? "#168dbd" : "#939393"}
                      className={classes.starIcon}
                    />
                  </Tooltip>
                </IconButton>
                <IconButton onClick={() => deleteCard(index)}>
                  <DeleteOutlineOutlined />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    mediaCardWrapper: {
      width: "100%",
      border: 1,
      borderStyle: "solid",
      borderColor: "#dddddd",
      borderRadius: 2,
      height: "17rem",
    },
    cardImage: {
      height: "100%",
      width: "100%",
      borderRadius: "2px 0 0 2px",
      transition: "all 0.3s ease",
    },
    textField: {
      color: "black",
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(0, 0, 0, 0.23)",
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
      },
    },
    menuItem: {
      maxWidth: 280,
      overflowWrap: "break-word",
      display: "block",
      whiteSpace: "unset",
    },
    mediaSizeWrapper: {
      height: "100%",
    },
    mediaSize: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      height: "2rem",
      borderRadius: "2px 0 0 2px",
    },
    newSurveyPointDialog: {
      width: "20rem",
      "& > *:last-child": {
        padding: theme.spacing(2),
      },
    },
    starIcon: {
      height: 42,
      padding: 8,
    },
    image: {
      height: "100%",
      cursor: "pointer",
      outline: "none",
    },
  });

interface MediaCardIncomingProps {
  index: number;
  preview: string;
  siteId: number;
  surveyPoint: string;
  observation: string;
  comments: string;
  surveyPointOptions: SurveyPoints[];
  file?: File | null;
  featuredFile: number | null;
  handleSurveyPointOptionAdd: (arg0: string, arg1: SurveyPoints[]) => void;
  deleteCard: (index: number) => void;
  setFeatured: (index: number) => void;
  handleCommentsChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleObservationChange: (event: ChangeEvent<{ value: unknown }>) => void;
  handleSurveyPointChange: (event: ChangeEvent<{ value: unknown }>) => void;
}

MediaCard.defaultProps = {
  file: null,
};

type MediaCardProps = MediaCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(MediaCard);

/* eslint-disable fp/no-mutating-methods */
import React from "react";
import {
  Grid,
  withStyles,
  WithStyles,
  createStyles,
  Theme,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import L from "leaflet";
import { Map as LeafletMap, TileLayer, Marker } from "react-leaflet";
import { Reef } from "../../../../store/Reefs/types";

import marker from "../../../../assets/marker.png";

const pinIcon = L.icon({
  iconUrl: marker,
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [0, -41],
});

const numberedIcon = (id: number) =>
  L.divIcon({
    className: "leaflet-numbered-marker",
    iconSize: [36, 40.5],
    iconAnchor: [10, 30],
    popupAnchor: [0, -41],
    html: `<span class="leaflet-numbered-marker-text">${id}</span>`,
  });

const Map = ({ reef, classes }: MapProps) => {
  const history = useHistory();
  const points = reef.surveyPoints;
  const [lng, lat] =
    reef.polygon.type === "Point" ? reef.polygon.coordinates : [0, 0];

  // TODO: Replace these with the actual survey points locations
  const randomPoints = points.map(() => [
    lat + Math.random() / 100,
    lng + Math.random() / 100,
  ]);

  return (
    <Grid className={classes.mapWrapper} item xs={12} md={4}>
      <LeafletMap
        zoomControl={false}
        className={classes.map}
        center={[lat, lng]}
        zoom={13}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
        <Marker icon={pinIcon} position={[lat, lng]} />
        {randomPoints.map((point, index) => (
          <Marker
            key={points[index].id}
            onclick={() =>
              history.push(`/reefs/${reef.id}/points/${points[index].id}`)
            }
            icon={numberedIcon(points[index].id)}
            position={[point[0], point[1]]}
          />
        ))}
      </LeafletMap>
    </Grid>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    mapWrapper: {
      padding: 16,
    },
    map: {
      borderRadius: 5,
      height: 280,
      width: "100%",
      [theme.breakpoints.down("sm")]: {
        height: 300,
      },
    },
  });

interface MapIncomingProps {
  reef: Reef;
}

type MapProps = MapIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Map);

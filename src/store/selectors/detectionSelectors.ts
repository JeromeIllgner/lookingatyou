import { createSelector } from 'reselect';
import { EyeSide } from '../../AppConstants';
import { Detections } from '../../models/objectDetection';
import select, {
    calculateColourMatch,
    closerToPrediction,
    getPredictedColour,
    getPredictedTarget,
} from '../../utils/objectSelection/select';
import { calculateNormalisedPos } from '../../utils/objectTracking/calculateFocus';
import { IColour, ICoords } from '../../utils/types';
import { IRootStore } from '../reducers/rootReducer';
import { getImageData, getVideos } from './videoSelectors';

export function getDetections(state: IRootStore): Detections {
    return state.detectionStore.detections;
}

export const getSelections = createSelector(
    [getDetections, getPreviousTargets, getPreviousColours, getImageData],
    (detections, previousTargets, previousColours, imageDataMap) => {
        const imageData = imageDataMap[EyeSide.LEFT];

        const predictedTarget = getPredictedTarget(previousTargets);
        const predictedColour = getPredictedColour(previousColours);

        const selection = select(
            detections,
            closerToPrediction(predictedTarget, imageData, predictedColour),
        );
        return selection;
    },
);

export const getTargets = createSelector(
    [getSelections, getVideos, getIdleTargets],
    (selections, videos, idleTargets): ICoords => {
        const left =
            selections === undefined || !videos[0]
                ? undefined
                : calculateNormalisedPos(
                      selections.bbox,
                      videos[0]!.width,
                      videos[0]!.height,
                  );
        if (left) {
            return left;
        } else {
            return idleTargets;
        }
    },
);

export const getColour = createSelector(
    [getSelections, getImageData],
    (selection, imageDataMap): IColour => {
        const imageData = imageDataMap[EyeSide.LEFT];
        if (selection) {
            const colour = calculateColourMatch(
                imageData,
                selection.info.keypoints,
            );
            return colour;
        }
        return { r: 0, g: 0, b: 0 };
    },
);

export function getPreviousTarget(state: IRootStore): ICoords {
    return state.detectionStore.history[state.detectionStore.history.length - 1]
        .target;
}

export function getPreviousTargets(state: IRootStore): ICoords[] {
    return state.detectionStore.history.map(history => history.target);
}

export function getPreviousColour(state: IRootStore): IColour {
    return state.detectionStore.history[state.detectionStore.history.length - 1]
        .colour;
}

export function getPreviousColours(state: IRootStore): IColour[] {
    return state.detectionStore.history.map(history => history.colour);
}

export function getIdleTargets(state: IRootStore): ICoords {
    return state.detectionStore.idleTarget;
}

export function getOpenCoefficient(state: IRootStore): number {
    return state.detectionStore.eyesOpenCoefficient;
}

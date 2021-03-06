import {
    IVideo,
    IVideoState,
    SET_VIDEO,
    SET_VIDEO_STREAM,
    TOGGLE_WEBCAM_AVAILABLE,
    VideoAction,
} from '../../../store/actions/video/types';
import videoStore from '../../../store/reducers/videoReducer';

const mockInitialState: IVideo = {
    width: 260,
    height: 380,
    stream: undefined,
};

const array = new Uint8ClampedArray(0);
const video = { width: 0, height: 0, stream: undefined };
const imgData = { width: 0, height: 0, data: array };

let mockStore: IVideoState;

describe('Video Reducer', () => {
    beforeEach(() => {
        mockStore = videoStore(
            { video, webcamAvailable: false, image: imgData },
            { type: SET_VIDEO_STREAM, payload: mockInitialState },
        );
    });

    it('should return the initial state', () => {
        const expectedState: IVideoState = {
            video: mockInitialState,
            webcamAvailable: false,
            image: imgData,
        };
        expect(mockStore).toEqual(expectedState);
    });

    it('should return a new state when dispaching Set Video Stream action', () => {
        const newState = videoStore(mockStore, {
            type: SET_VIDEO_STREAM,
            payload: mockInitialState,
        });
        const expectedState = {
            video: mockInitialState,
            webcamAvailable: false,
            image: imgData,
        };
        expect(newState).toEqual(expectedState);
    });

    it('should add HTML element when dispatching Set Vide action', () => {
        const videoElement = document.createElement('video');
        const mockSetVideoAction: VideoAction = {
            type: SET_VIDEO,
            payload: videoElement,
        };
        const newState = videoStore(mockStore, mockSetVideoAction);
        const expectedState = mockStore;
        expectedState.video.videoElement = videoElement;
        expect(newState).toEqual(expectedState);
    });

    it('should toggle webcam available flag', () => {
        const newState = videoStore(mockStore, {
            type: TOGGLE_WEBCAM_AVAILABLE,
        });
        expect(newState.webcamAvailable).toBeTruthy();
    });
});

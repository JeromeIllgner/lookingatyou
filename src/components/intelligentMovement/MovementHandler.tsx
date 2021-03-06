import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {
    chanceOfIdleEyesMovement,
    eyelidPosition,
    intervals,
    lightConsts,
    pupilSizes,
} from '../../AppConstants';
import { IDetection } from '../../models/objectDetection';
import { setAnimation } from '../../store/actions/detections/actions';
import { ISetAnimationAction } from '../../store/actions/detections/types';
import { IRootStore } from '../../store/reducers/rootReducer';
import { getFPS } from '../../store/selectors/configSelectors';
import {
    getAnimationExists,
    getAnimations,
    getSelections,
    getTargets,
} from '../../store/selectors/detectionSelectors';
import { getImageData } from '../../store/selectors/videoSelectors';
import { normalise } from '../../utils/objectTracking/calculateFocus';
import { Animation, naturalMovement } from '../../utils/pose/animations';
import { ICoords } from '../../utils/types';
import EyeController from '../eye/EyeController';
import { analyseLight } from '../eye/utils/MovementUtils';
import { userInteraction } from '../fadeInText/FadeInConstants';
import FadeInText from '../fadeInText/FadeInText';

interface IMovementProps {
    width: number;
    height: number;
    environment: Window;
}

interface IStateProps {
    fps: number;
    selection?: IDetection;
    target: ICoords;
    image: ImageData;
    animation: Animation;
    animationExists: boolean;
}

interface IDispatchProps {
    updateAnimation: (animation: Animation) => ISetAnimationAction;
}

interface IMovementState {
    showText: boolean;
    text: string;
    isSleeping: boolean;
    dilationCoefficient: number;
    openCoefficient: number;
    personDetected: boolean;
}

export type MovementHandlerProps = IMovementProps &
    IDispatchProps &
    IStateProps;

export class MovementHandler extends React.Component<
    MovementHandlerProps,
    IMovementState
> {
    private movementInterval: number;
    private sleepTimeout: number;
    private textTimeout: number;
    private hasMovedLeft: boolean;

    constructor(props: MovementHandlerProps) {
        super(props);

        this.state = {
            showText: false,
            text: '',
            isSleeping: false,
            dilationCoefficient: pupilSizes.neutral,
            openCoefficient: eyelidPosition.OPEN,
            personDetected: false,
        };

        this.movementInterval = 0;
        this.sleepTimeout = 0;
        this.textTimeout = 0;
        this.hasMovedLeft = false;

        this.animateEye = this.animateEye.bind(this);
        this.sleep = this.sleep.bind(this);
    }

    componentDidMount() {
        this.movementInterval = this.props.environment.setInterval(
            this.animateEye,
            1000 / this.props.fps,
        );
    }

    shouldComponentUpdate(
        nextProps: MovementHandlerProps,
        nextState: IMovementState,
    ) {
        return (
            this.props.height !== nextProps.height ||
            this.props.width !== nextProps.width ||
            this.state.isSleeping !== nextState.isSleeping ||
            (!this.props.animationExists &&
                (this.props.target !== nextProps.target ||
                    this.props.selection !== nextProps.selection))
        );
    }

    componentWillReceiveProps(nextProps: MovementHandlerProps) {
        if (nextProps.animationExists && this.textTimeout) {
            this.props.environment.clearTimeout(this.textTimeout);
            this.textTimeout = 0;
        }
    }

    animateEye() {
        this.checkSelection();
        this.calculateBrightness();
    }

    componentWillUnmount() {
        this.props.environment.clearInterval(this.movementInterval);
    }

    calculateBrightness() {
        if (this.props.image) {
            const brightness = analyseLight(this.props.image);

            const dilationCoefficient = normalise(
                lightConsts.maxBrightness - brightness,
                lightConsts.maxBrightness,
                0,
                lightConsts.dilationMultipler + lightConsts.dilationOffset,
                lightConsts.dilationOffset,
            );
            const openCoefficient =
                brightness >= lightConsts.maxBrightness
                    ? eyelidPosition.CLOSED
                    : eyelidPosition.OPEN;
            this.setState({ dilationCoefficient, openCoefficient });
        }
    }

    checkSelection() {
        const isSquint = this.state.openCoefficient === eyelidPosition.SQUINT;
        if (isSquint && Math.random() < 0.1) {
            this.setState({ openCoefficient: eyelidPosition.OPEN });
        }

        if (this.props.selection) {
            this.setNewTarget();
            this.startTextTimer();
        } else {
            this.setNoTarget();

            if (!this.props.animationExists && !this.state.isSleeping) {
                if (Math.random() < chanceOfIdleEyesMovement) {
                    this.hasMovedLeft = !this.hasMovedLeft;
                    this.props.updateAnimation(
                        naturalMovement(this.hasMovedLeft),
                    );
                }
            }
        }
    }

    setNewTarget() {
        this.wake();
        this.props.environment.clearTimeout(this.sleepTimeout);
        if (!this.state.personDetected) {
            this.setState({
                personDetected: true,
                dilationCoefficient: pupilSizes.dilated,
            });
        }
    }

    setNoTarget() {
        if (this.state.personDetected) {
            this.setState({
                personDetected: false,
                openCoefficient: eyelidPosition.SQUINT,
            });
            this.sleepTimeout = this.props.environment.setTimeout(
                this.sleep,
                intervals.sleep,
            );
        }
        this.props.environment.clearTimeout(this.textTimeout);
        this.textTimeout = 0;
    }

    sleep() {
        this.setState({ isSleeping: true });
    }

    wake() {
        this.setState({ isSleeping: false });
    }

    startTextTimer() {
        if (this.textTimeout > 0) {
            return;
        }

        this.textTimeout = this.props.environment.setTimeout(() => {
            const totalFrequency = userInteraction.texts
                .map(text => text.frequency)
                .reduce((x, y) => x + y);

            let random = Math.random() * totalFrequency;
            let i = 0;

            while (random >= 0 && i < userInteraction.texts.length - 1) {
                random -= userInteraction.texts[i].frequency;
                i++;
            }

            const phrase = userInteraction.texts[i - 1].phrase;

            this.setState({
                showText: true,
                text: phrase,
            });

            this.props.environment.setTimeout(() => {
                this.setState({ showText: false });
                this.textTimeout = 0;
            }, userInteraction.textDuration);
        }, userInteraction.delay);
    }

    render() {
        return (
            <div className="movementHandler">
                <EyeController
                    dilation={this.state.dilationCoefficient}
                    detected={this.state.personDetected}
                    openCoefficient={this.state.openCoefficient}
                    isSleeping={this.state.isSleeping}
                    {...this.props}
                />
                <FadeInText text={this.state.text} show={this.state.showText} />
            </div>
        );
    }
}

const mapStateToProps = (state: IRootStore) => ({
    fps: getFPS(state),
    selection: getSelections(state),
    target: getTargets(state),
    image: getImageData(state),
    animation: getAnimations(state),
    animationExists: getAnimationExists(state),
});

const mapDispatchToProps = (dispatch: Dispatch): IDispatchProps => ({
    updateAnimation: (animation: Animation) =>
        dispatch(setAnimation(animation)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MovementHandler);

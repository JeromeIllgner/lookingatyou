import React from 'react';
import { IConfigState, PartialConfig } from '../../store/actions/config/types';
import { HelpWith } from './Help';
import CheckBoxMenuItem from './menuItems/CheckBoxMenuItem';
import DropDownMenuItem from './menuItems/DropDownMenuItem';
import NumberMenuItem from './menuItems/NumberMenuItem';

interface IAdvancedConfigProps {
    config: IConfigState;
    updateModelConfig: (payload: PartialConfig) => void;
    updateDetectionConfig: (payload: PartialConfig) => void;
}
export default function AdvancedConfig(props: IAdvancedConfigProps) {
    return (
        <React.Fragment>
            <h3>Model Config</h3>
            <DropDownMenuItem
                name={'Pose Model'}
                configName={'architecture'}
                onInputChange={props.updateModelConfig}
                values={['MobileNetV1', 'ResNet50']}
                defaultValue={props.config.modelConfig.architecture}
                helpWith={HelpWith.ARCHITECTURE}
            />
            <DropDownMenuItem
                name={'Output Stride'}
                configName={'outputStride'}
                onInputChange={props.updateModelConfig}
                values={
                    props.config.modelConfig.architecture === 'MobileNetV1'
                        ? ['8', '16']
                        : ['16', '32']
                }
                defaultValue={props.config.modelConfig.outputStride.toString()}
                helpWith={HelpWith.OUTPUT_STRIDE}
            />
            <DropDownMenuItem
                name={'Resolution'}
                configName={'inputResolution'}
                onInputChange={props.updateModelConfig}
                values={[
                    '161',
                    '193',
                    '257',
                    '289',
                    '321',
                    '353',
                    '385',
                    '417',
                    '449',
                    '481',
                    '513',
                    '801',
                ]}
                defaultValue={props.config.modelConfig.inputResolution.toString()}
                helpWith={HelpWith.RESOLUTION}
            />
            {props.config.modelConfig.architecture === 'MobileNetV1' && (
                <DropDownMenuItem
                    name={'Multiplier'}
                    configName={'multiplier'}
                    onInputChange={props.updateModelConfig}
                    values={['0.50', '0.75', '1']}
                    defaultValue={props.config.modelConfig.multiplier.toString()}
                    helpWith={HelpWith.MULTIPLIER}
                />
            )}

            <h3>Detection Config</h3>
            <NumberMenuItem
                name={'Detections'}
                configName={'maxDetections'}
                step={1}
                defaultValue={props.config.detectionConfig.maxDetections}
                onValidInput={props.updateDetectionConfig}
                helpWith={HelpWith.DETECTIONS}
                min={1}
            />
            <CheckBoxMenuItem
                name={'Flip Horizontal'}
                configName={'flipHorizontal'}
                helpWith={HelpWith.FLIP}
                checked={props.config.detectionConfig.flipHorizontal}
                onInputChange={props.updateDetectionConfig}
            />
            <NumberMenuItem
                name={'Min Score'}
                configName={'scoreThreshold'}
                helpWith={HelpWith.MIN_SCORE}
                step={0.01}
                defaultValue={props.config.detectionConfig.scoreThreshold}
                onValidInput={props.updateDetectionConfig}
                min={0}
                max={1}
            />
            <NumberMenuItem
                name={'NMS Radius'}
                configName={'nmsRadius'}
                helpWith={HelpWith.NMS_RADIUS}
                step={1}
                defaultValue={props.config.detectionConfig.nmsRadius}
                onValidInput={props.updateDetectionConfig}
                min={1}
            />
        </React.Fragment>
    );
}
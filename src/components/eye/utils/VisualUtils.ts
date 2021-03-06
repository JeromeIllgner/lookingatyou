import { minIrisScale } from '../../../AppConstants';
import { normalise } from '../../../utils/objectTracking/calculateFocus';
import { ICoords } from '../../../utils/types';

export function irisMatrixTransform(position: ICoords) {
    const radius = Math.hypot(position.x, position.y);
    if (radius === 0) {
        return '';
    }

    const scale =
        minIrisScale + normalise(1 - radius, 1, 0, 1 - minIrisScale, 0);

    const xDivR = position.x / radius;
    const yDivR = position.y / radius;
    const xDivR2 = Math.pow(xDivR, 2);
    const yDivR2 = Math.pow(yDivR, 2);

    const xScale = scale * xDivR2 + yDivR2;
    const yScale = yDivR2 * scale + xDivR2;
    const skew = (1 - scale) * xDivR * yDivR;
    return `matrix(${xScale},${skew},${skew},${yScale},0,0)`;
}

export function generateInnerPath(radius: number, sectors: number) {
    const innerRadius = radius * 0.1;
    const outerRadius = radius * 0.9;
    const radianStep = (2 * Math.PI) / sectors;
    const innerOffset = -radianStep / 2;

    let currInnerPath = `M ${innerRadius *
        Math.cos(radianStep * (sectors - 1))} ${innerRadius *
        Math.sin(radianStep * (sectors - 1))} `;
    for (let i = 0; i < sectors; i++) {
        const currRadianStep = radianStep * i;
        const lineOut = `L ${outerRadius *
            Math.cos(currRadianStep + innerOffset)} ${outerRadius *
            Math.sin(currRadianStep + innerOffset)} `;

        const lineIn = `L ${innerRadius *
            Math.cos(currRadianStep)} ${innerRadius *
            Math.sin(currRadianStep)} `;

        currInnerPath += lineOut;
        currInnerPath += lineIn;
    }
    return currInnerPath;
}

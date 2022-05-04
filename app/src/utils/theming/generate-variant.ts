import chroma from 'chroma-js';
import { clamp } from 'lodash';

/**
 *
 *
 * @param baseColor      Source color
 * @param mixColor       Mix color
 * @param deltaLum       Value between 0 and 100. Sets the desired luminosity shift.
 * @param relativeToBase If contrast should be calculated relative to base color.
 *                       If true, the luminosity difference will be set relative
 *                       to the base color. If false, the luminosity difference
 *                       will be set relative to the mix color.
 * @returns {string}     Hex color string
 */
export function findAtRelativeLuminosity(baseColor: string, mixColor: string, deltaLum = 10, relativeToBase = true) {
	// If no difference, return
	if (baseColor === mixColor) return baseColor;

	const staticColor = chroma(relativeToBase ? mixColor : baseColor);
	const relativeColor = chroma(relativeToBase ? baseColor : mixColor);

	const lumA = staticColor.lab()[0];
	const lumB = relativeColor.lab()[0];

	/**
	 * Here we're picking an arbitrary number of significant digits to compare the luminance
	 * of both colors. Raw comparisons can lead to false negatives due to floating point
	 * percision errors.
	 *
	 * In our later algorithm, we're dividing by `-lumA + lumB`. If they're equal, we would
	 * be dividing by zero. Instead, we'll just return the base color.
	 */
	if (lumA.toFixed(4) === lumB.toFixed(4)) return baseColor;

	/**
	 * Luminance will always shift toward secondary color. Maximum shift will be equal
	 * to distance between luminance of each color.
	 */
	const maxDelta = Math.abs(lumA - lumB);

	const clampedDelta = clamp(deltaLum, 0, maxDelta);

	const shiftDir = lumA >= lumB ? 1 : -1;

	const desiredLum = clamp(lumB + clampedDelta * shiftDir, 0, 100);

	/**
	 * We'll mix the colors in the L*a*b* color space. The luminance in CIELAB, the L*, is a percentage value,
	 * 0-100. We want to ensure the luminosity of mixed colors is consistent with regard to unchanging mixColor
	 * values and deltaLum values. To do so, here we will calculate the required mix amount between the base
	 * and mix color to achieve the desired shift (deltaLum).
	 *
	 * The method for a standard mix is simply an average of each value (L, a, and b).
	 * The algebra for each calculation is trivial:
	 *
	 * > (valA + valB) / 2 = valAvg
	 *
	 * To perform a mix of variable ratio, a weighted average, we must reframe the equation. What is
	 * exactly being calculated is:
	 *
	 * > valA*(1-W) + valB*W = valWghtAvg
	 * Where W is a value 0 - 1
	 *
	 * Therefore, we can use the above equation to determine the weight to pass to our mix function,
	 * to output the color most closely matching our desired luminosity.
	 *
	 * Note: using `lumA` and `lumB`, instead of explicit base or mix color luminosity, since
	 * the relative value can change depending on the `relativeToBase` parameter.
	 * From:
	 *
	 * > lumA*(1-W) + lumB*W = desiredLum
	 *
	 * We can derive:
	 *
	 *       desiredLum - lumA
	 * W = --------------------- ; Where lumA != lumB
	 *         -lumA + lumB
	 *
	 */

	const weightForLum = Math.abs((desiredLum - lumA) / (-lumA + lumB));

	const mixAtLum = chroma.mix(staticColor, relativeColor, weightForLum, 'lab');

	return mixAtLum.hex();
}

import chroma from 'chroma-js';
import { clamp } from 'lodash';

/**
 *
 * Contrast ratio is a range between 1:1 and 21:1. This function takes a base color (baseColor),
 * and a mix color (endColor), and mixes them recursively in an attempt to find the median color
 * that most closely matches the desired contrast (desiredContrast).
 *
 * If the maximum contrast between the input colors is less than the desired contrast,
 * it will find the color with the highest contrast which does not intersect the contrast
 * range specified by the endBuffer.
 *
 * If the maximum contrast is less than the sum of the end buffer and the base buffer, it
 * will pull the color closest to the median of the available contrast range, in an attempt to
 * avoid returning either of the input colors.
 *
 * @param baseColor        Source color
 * @param endColor         Mix color
 * @param desiredContrast  Contrast value to find if within feasible range
 * @param endBuffer        Minimum contrast distance from endColor
 * @param baseBuffer       Minimum contrast distance from baseColor
 * @param relativeToBase   If contrast should be calculated relative to base color.
 *                         If true, the algorithm will calculate the contrast as a
 *                         distance from the base color.
 *                         If false, the algorithm will calculate the contrast as
 *                         a distance from the end color.
 * @returns {string}       Hex color string
 */
export function findAtContrastRatio(
	baseColor: string,
	endColor: string,
	desiredContrast = 4.5,
	endBuffer = 0.2,
	baseBuffer = 0.2,
	relativeToBase = true
) {
	// If no difference, return
	if (baseColor === endColor) return baseColor;

	// We can only work with positive nums
	desiredContrast = Math.abs(desiredContrast);
	endBuffer = Math.abs(endBuffer);
	baseBuffer = Math.abs(baseBuffer);

	const slidingColor = relativeToBase ? endColor : baseColor;
	const staticColor = relativeToBase ? baseColor : endColor;

	let contrastTarget = desiredContrast;

	const maxContrast = chroma.contrast(staticColor, slidingColor);

	endBuffer = clamp(endBuffer, 0, maxContrast);
	baseBuffer = clamp(baseBuffer, 0, maxContrast);

	/**
	 * The same color gives a contrast ratio of 1:1, thus,our feasible range is the
	 * max contrast minus 1. If the feasible range is greater than the sum of the
	 * buffers, we'll set the contrast target to the midpoint of the range
	 */
	if (maxContrast - 1 <= endBuffer + baseBuffer) {
		contrastTarget = (maxContrast - 1) / 2 + 1;
	} else if (maxContrast < desiredContrast + endBuffer) {
		/**
		 * If the range is too small, set contrast target as high as possible
		 * without intersecting endBuffer (won't intersect baseBuffer thanks
		 * to the previous check)
		 */
		contrastTarget = maxContrast - endBuffer;
	}

	// Clamp to lower range of 1, in event that desiredContrast was less than 1
	contrastTarget = clamp(contrastTarget, 1, maxContrast);

	if (contrastTarget === 1) return staticColor;
	if (contrastTarget === maxContrast) return slidingColor;

	/**
	 * If we haven't returned by now, then we have a feasible contrast ratio
	 * target. Now we'll effectively do a binary search to find the color in
	 * the given color scale that most closely matches the contrast ratio.
	 */
	function contrastRatioSearch(rangeA: string, rangeB: string, previousRange: string[] = []): string | void {
		/**
		 * If the current range matches the previous range, we've gotten as
		 * close as possible to the target ratio.
		 */
		if (previousRange.length > 0 && previousRange[0] === rangeA && previousRange[1] === rangeB) {
			// Choose whichever color is closest to the target ratio
			if (
				Math.abs(contrastTarget - chroma.contrast(staticColor, rangeA)) <
				Math.abs(contrastTarget - chroma.contrast(staticColor, rangeB))
			)
				return rangeA;
			return rangeB;
		}
		const medianColor = chroma.mix(rangeA, rangeB, 0.5, 'lab');
		const contrast = chroma.contrast(staticColor, medianColor);
		// contrast falls in range
		if (contrast === contrastTarget) {
			return medianColor.hex();
		}
		// Contrast is higher than target, narrow range to lower half
		if (contrast > contrastTarget) {
			return contrastRatioSearch(rangeA, medianColor.hex(), [rangeA, rangeB]);
		}
		// Contrast is lower than target, narrow range to upper half
		if (contrast < contrastTarget) {
			return contrastRatioSearch(medianColor.hex(), rangeB, [rangeA, rangeB]);
		}
	}

	return contrastRatioSearch(staticColor, slidingColor);
}

import chroma from 'chroma-js';
import { clamp } from 'lodash';

/**
 *
 * Contrast ratios are a range between 1:1 and 21:1. This function takes a base color (baseColor),
 * and a mix color (endColor), generates a hue-shifted range between them and attempts to find
 * the color in the range that most closely matches the desired contrast ratio (desiredContrast).
 *
 * If the maximum contrast ratio between the input colors is less than the desired contrast ratio,
 * it will find the color with the highest contrast ratio which does not intersect the contrast
 * range specified by the endBuffer.
 *
 * If the maximum contrast ratio is less than the sum of the end buffer and the base buffer, it
 * will pull the color closest to the median of the available contrast range, in an attempt to
 * avoid returning either of the input colors.
 *
 * @param baseColor        Source color
 * @param endColor         Mix color
 * @param desiredContrast  Contrast ratio to find if within feasible range
 * @param endBuffer        Minimum contrast distance from endColor
 * @param baseBuffer       Minimum contrast distance from baseColor
 * @returns {string}       Hex color string
 */
export function findAtContrastRatio(
	baseColor: string,
	endColor: string,
	desiredContrast = 4.5,
	endBuffer = 0.2,
	baseBuffer = 0.2
) {
	// If no difference, return
	if (baseColor === endColor) return baseColor;

	// We can only work with positive nums
	desiredContrast = Math.abs(desiredContrast);
	endBuffer = Math.abs(endBuffer);
	baseBuffer = Math.abs(baseBuffer);

	let contrastTarget = desiredContrast;

	const maxContrast = chroma.contrast(baseColor, endColor);

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

	if (contrastTarget === 1) return baseColor;
	if (contrastTarget === maxContrast) return endColor;

	/**
	 * If we haven't returned by now, then we have a feasible contrast ratio
	 * target. Now we'll effectively do a binary search to find the color in
	 * the given color scale that most closely matches the contrast ratio.
	 */
	function contrastRatioSearch(rangeA, rangeB, previousRange = []) {
		/**
		 * If the current range matches the previous range, we've gotten as
		 * close as possible to the target ratio.
		 */
		if (previousRange.length > 0 && previousRange[0] === rangeA && previousRange[1] === rangeB) {
			// Choose whichever color is closest to the target ratio
			if (
				Math.abs(contrastTarget - chroma.contrast(baseColor, rangeA)) <
				Math.abs(contrastTarget - chroma.contrast(baseColor, rangeB))
			)
				return rangeA;
			return rangeB;
		}
		const medianColor = chroma.scale([rangeA, rangeB]).mode('lab').colors(3)[1];
		const contrast = chroma.contrast(baseColor, medianColor);
		// contrast falls in range
		if (contrast === contrastTarget) {
			return medianColor;
		}
		// Contrast is higher than target, narrow range to lower half
		if (contrast > contrastTarget) {
			return contrastRatioSearch(rangeA, medianColor, [rangeA, rangeB]);
		}
		// Contrast is lower than target, narrow range to upper half
		if (contrast < contrastTarget) {
			return contrastRatioSearch(medianColor, rangeB, [rangeA, rangeB]);
		}
	}

	return contrastRatioSearch(baseColor, endColor);
}

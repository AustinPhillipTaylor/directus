import express from 'express';
import { ForbiddenException, InvalidPayloadException } from '../exceptions';
import { respond } from '../middleware/respond';
import useCollection from '../middleware/use-collection';
import { SettingsService } from '../services';
import asyncHandler from '../utils/async-handler';
import { isValidThemeJson } from '../utils/validate-theme-json';
import { omitBy, isEmpty } from 'lodash';

const router = express.Router();

router.use(useCollection('directus_settings'));

router.get(
	'/',
	asyncHandler(async (req, res, next) => {
		const service = new SettingsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		const records = await service.readSingleton(req.sanitizedQuery);
		res.locals.payload = { data: records || null };
		return next();
	}),
	respond
);

// TODO: Add themes endpoint to GraphQL
// TODO: Create export endpoint
router.get(
	'/themes/export',
	asyncHandler(async (req, res, next) => {
		return next();
	}),
	respond
);

router.patch(
	'/themes',
	asyncHandler(async (req, res, next) => {
		const error = isValidThemeJson(req.body);
		if (error !== undefined) {
			throw new InvalidPayloadException(error.message);
		}

		const service = new SettingsService({
			accountability: req.accountability,
			schema: req.schema,
		});

		let combinedOverrides = {};

		/**
		 * We only want to overwrite a theme's overrides if it's explicitly passed.
		 * So here we'll get the current overrides then combine them with the
		 * overrides from the request body.
		 */
		try {
			const record = await service.readSingleton(req.sanitizedQuery);
			const currentOverrides = record.theme_overrides || {};
			/**
			 * We'll allow deleting theme overrides by passing an empty object.
			 * We'll omit any empty objects before upserting the value.
			 */
			combinedOverrides = omitBy({ ...currentOverrides, ...req.body }, isEmpty);
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		/**
		 * This endpoint only accepts the theme list, we need to modify
		 * the query to target the theme_overrides column
		 */
		const column = { theme_overrides: combinedOverrides };

		await service.upsertSingleton(column);

		try {
			const record = await service.readSingleton(req.sanitizedQuery);
			res.locals.payload = { data: record || null };
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond
);

router.patch(
	'/',
	asyncHandler(async (req, res, next) => {
		/**
		 * We want to have more modular control over how themes are saved
		 * so we'll enforce usage of the /themes endpoint instead of directly
		 * altering theme_overrides
		 */
		if (req.body.theme_overrides !== undefined) {
			throw new InvalidPayloadException('Themes should be updated at the /settings/themes endpoints.');
		}

		const service = new SettingsService({
			accountability: req.accountability,
			schema: req.schema,
		});
		await service.upsertSingleton(req.body);

		try {
			const record = await service.readSingleton(req.sanitizedQuery);
			res.locals.payload = { data: record || null };
		} catch (error: any) {
			if (error instanceof ForbiddenException) {
				return next();
			}

			throw error;
		}

		return next();
	}),
	respond
);

export default router;

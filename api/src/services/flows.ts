import { AbstractServiceOptions, Item, PrimaryKey, MutationOptions } from '../types';
import { getFlowManager } from '../flows';
import { ItemsService } from './items';
import { FlowRaw } from '@directus/shared/types';

export class FlowsService extends ItemsService<FlowRaw> {
	constructor(options: AbstractServiceOptions) {
		super('directus_flows', options);
	}

	async createOne(data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey> {
		const flowManager = getFlowManager();

		const result = await super.createOne(data, opts);
		await flowManager.reload();

		return result;
	}

	async createMany(data: Partial<Item>[], opts?: MutationOptions): Promise<PrimaryKey[]> {
		const flowManager = getFlowManager();

		const result = await super.createMany(data, opts);
		await flowManager.reload();

		return result;
	}

	async updateOne(key: PrimaryKey, data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey> {
		const flowManager = getFlowManager();

		const result = await super.updateOne(key, data, opts);
		await flowManager.reload();

		return result;
	}

	async updateMany(keys: PrimaryKey[], data: Partial<Item>, opts?: MutationOptions): Promise<PrimaryKey[]> {
		const flowManager = getFlowManager();

		const result = await super.updateMany(keys, data, opts);
		await flowManager.reload();

		return result;
	}

	async deleteOne(key: PrimaryKey, opts?: MutationOptions): Promise<PrimaryKey> {
		const flowManager = getFlowManager();

		const result = await super.deleteOne(key, opts);
		await flowManager.reload();

		return result;
	}

	async deleteMany(keys: PrimaryKey[], opts?: MutationOptions): Promise<PrimaryKey[]> {
		const flowManager = getFlowManager();

		const result = await super.deleteMany(keys, opts);
		await flowManager.reload();

		return result;
	}
}

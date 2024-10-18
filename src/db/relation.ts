import { relations } from "drizzle-orm/relations";
import { qualityInspections, qualityMetrics, productionOrders, materialUsage, rawMaterials, products, productionSteps, machines, defects, productionMetrics, machineMetrics } from "./schema";

export const qualityMetricsRelations = relations(qualityMetrics, ({one}) => ({
	qualityInspection: one(qualityInspections, {
		fields: [qualityMetrics.inspectionId],
		references: [qualityInspections.id]
	}),
}));

export const qualityInspectionsRelations = relations(qualityInspections, ({one, many}) => ({
	qualityMetrics: many(qualityMetrics),
	productionOrder: one(productionOrders, {
		fields: [qualityInspections.productionOrderId],
		references: [productionOrders.id]
	}),
	defects: many(defects),
}));

export const materialUsageRelations = relations(materialUsage, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [materialUsage.productionOrderId],
		references: [productionOrders.id]
	}),
	rawMaterial: one(rawMaterials, {
		fields: [materialUsage.rawMaterialId],
		references: [rawMaterials.id]
	}),
}));

export const productionOrdersRelations = relations(productionOrders, ({one, many}) => ({
	materialUsages: many(materialUsage),
	product: one(products, {
		fields: [productionOrders.productId],
		references: [products.id]
	}),
	productionSteps: many(productionSteps),
	qualityInspections: many(qualityInspections),
	productionMetrics: many(productionMetrics),
}));

export const rawMaterialsRelations = relations(rawMaterials, ({many}) => ({
	materialUsages: many(materialUsage),
}));

export const productsRelations = relations(products, ({many}) => ({
	productionOrders: many(productionOrders),
}));

export const productionStepsRelations = relations(productionSteps, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [productionSteps.productionOrderId],
		references: [productionOrders.id]
	}),
	machine: one(machines, {
		fields: [productionSteps.machineId],
		references: [machines.id]
	}),
}));

export const machinesRelations = relations(machines, ({many}) => ({
	productionSteps: many(productionSteps),
	productionMetrics: many(productionMetrics),
	machineMetrics: many(machineMetrics),
}));

export const defectsRelations = relations(defects, ({one}) => ({
	qualityInspection: one(qualityInspections, {
		fields: [defects.inspectionId],
		references: [qualityInspections.id]
	}),
}));

export const productionMetricsRelations = relations(productionMetrics, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [productionMetrics.productionOrderId],
		references: [productionOrders.id]
	}),
	machine: one(machines, {
		fields: [productionMetrics.machineId],
		references: [machines.id]
	}),
}));

export const machineMetricsRelations = relations(machineMetrics, ({one}) => ({
	machine: one(machines, {
		fields: [machineMetrics.machineId],
		references: [machines.id]
	}),
}));
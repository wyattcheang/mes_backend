import { relations } from "drizzle-orm/relations";
import { products, billOfMaterials, rawMaterials, productionOrders, materialConsumption, productionMetrics, qualityInspections } from "./schema";

export const billOfMaterialsRelations = relations(billOfMaterials, ({one}) => ({
	product: one(products, {
		fields: [billOfMaterials.productId],
		references: [products.productId]
	}),
	rawMaterial: one(rawMaterials, {
		fields: [billOfMaterials.materialId],
		references: [rawMaterials.materialId]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	billOfMaterials: many(billOfMaterials),
	productionOrders: many(productionOrders),
}));

export const rawMaterialsRelations = relations(rawMaterials, ({many}) => ({
	billOfMaterials: many(billOfMaterials),
	materialConsumptions: many(materialConsumption),
}));

export const productionOrdersRelations = relations(productionOrders, ({one, many}) => ({
	product: one(products, {
		fields: [productionOrders.productId],
		references: [products.productId]
	}),
	materialConsumptions: many(materialConsumption),
	productionMetrics: many(productionMetrics),
	qualityInspections: many(qualityInspections),
}));

export const materialConsumptionRelations = relations(materialConsumption, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [materialConsumption.orderId],
		references: [productionOrders.orderId]
	}),
	rawMaterial: one(rawMaterials, {
		fields: [materialConsumption.materialId],
		references: [rawMaterials.materialId]
	}),
}));

export const productionMetricsRelations = relations(productionMetrics, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [productionMetrics.orderId],
		references: [productionOrders.orderId]
	}),
}));

export const qualityInspectionsRelations = relations(qualityInspections, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [qualityInspections.orderId],
		references: [productionOrders.orderId]
	}),
}));
import { relations } from "drizzle-orm/relations";
import { products, productionOrders, productionTracking, machines, machineUtilization, qualityInspections, qualityDefects } from "./schema";

export const productionOrdersRelations = relations(productionOrders, ({one, many}) => ({
	product: one(products, {
		fields: [productionOrders.productId],
		references: [products.productId]
	}),
	productionTrackings: many(productionTracking),
	machineUtilizations: many(machineUtilization),
	qualityInspections: many(qualityInspections),
}));

export const productsRelations = relations(products, ({many}) => ({
	productionOrders: many(productionOrders),
}));

export const productionTrackingRelations = relations(productionTracking, ({one}) => ({
	productionOrder: one(productionOrders, {
		fields: [productionTracking.orderId],
		references: [productionOrders.orderId]
	}),
}));

export const machineUtilizationRelations = relations(machineUtilization, ({one}) => ({
	machine: one(machines, {
		fields: [machineUtilization.machineId],
		references: [machines.machineId]
	}),
	productionOrder: one(productionOrders, {
		fields: [machineUtilization.orderId],
		references: [productionOrders.orderId]
	}),
}));

export const machinesRelations = relations(machines, ({many}) => ({
	machineUtilizations: many(machineUtilization),
}));

export const qualityInspectionsRelations = relations(qualityInspections, ({one, many}) => ({
	productionOrder: one(productionOrders, {
		fields: [qualityInspections.orderId],
		references: [productionOrders.orderId]
	}),
	qualityDefects: many(qualityDefects),
}));

export const qualityDefectsRelations = relations(qualityDefects, ({one}) => ({
	qualityInspection: one(qualityInspections, {
		fields: [qualityDefects.inspectionId],
		references: [qualityInspections.inspectionId]
	}),
}));
import { pgTable, serial, varchar, text, timestamp, numeric, index, foreignKey, integer, check, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const inspectionStatus = pgEnum("inspection_status", ['scheduled', 'in_progress', 'completed', 'failed'])
export const productionStatus = pgEnum("production_status", ['pending', 'in_progress', 'completed', 'halted'])



export const products = pgTable("products", {
	productId: serial("product_id").primaryKey().notNull(),
	productName: varchar("product_name", { length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const rawMaterials = pgTable("raw_materials", {
	materialId: serial("material_id").primaryKey().notNull(),
	materialName: varchar("material_name", { length: 100 }).notNull(),
	description: text(),
	unitOfMeasure: varchar("unit_of_measure", { length: 20 }).notNull(),
	currentStock: numeric("current_stock", { precision: 10, scale:  2 }).default('0'),
	minimumStock: numeric("minimum_stock", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const billOfMaterials = pgTable("bill_of_materials", {
	bomId: serial("bom_id").primaryKey().notNull(),
	productId: integer("product_id"),
	materialId: integer("material_id"),
	quantityRequired: numeric("quantity_required", { precision: 10, scale:  2 }).notNull(),
	unitOfMeasure: varchar("unit_of_measure", { length: 20 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxBomProduct: index("idx_bom_product").using("btree", table.productId.asc().nullsLast()),
		billOfMaterialsProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "bill_of_materials_product_id_fkey"
		}),
		billOfMaterialsMaterialIdFkey: foreignKey({
			columns: [table.materialId],
			foreignColumns: [rawMaterials.materialId],
			name: "bill_of_materials_material_id_fkey"
		}),
	}
});

export const productionOrders = pgTable("production_orders", {
	orderId: serial("order_id").primaryKey().notNull(),
	productId: integer("product_id"),
	quantityPlanned: integer("quantity_planned").notNull(),
	quantityProduced: integer("quantity_produced").default(0),
	status: varchar({ length: 20 }),
	startTime: timestamp("start_time", { mode: 'string' }),
	endTime: timestamp("end_time", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxProductionOrdersStatus: index("idx_production_orders_status").using("btree", table.status.asc().nullsLast()),
		productionOrdersProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "production_orders_product_id_fkey"
		}),
		productionOrdersStatusCheck: check("production_orders_status_check", sql`(status)::text = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])`),
	}
});

export const materialConsumption = pgTable("material_consumption", {
	consumptionId: serial("consumption_id").primaryKey().notNull(),
	orderId: integer("order_id"),
	materialId: integer("material_id"),
	quantityConsumed: numeric("quantity_consumed", { precision: 10, scale:  2 }).notNull(),
	consumedAt: timestamp("consumed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxMaterialConsumptionOrder: index("idx_material_consumption_order").using("btree", table.orderId.asc().nullsLast()),
		materialConsumptionOrderIdFkey: foreignKey({
			columns: [table.orderId],
			foreignColumns: [productionOrders.orderId],
			name: "material_consumption_order_id_fkey"
		}),
		materialConsumptionMaterialIdFkey: foreignKey({
			columns: [table.materialId],
			foreignColumns: [rawMaterials.materialId],
			name: "material_consumption_material_id_fkey"
		}),
	}
});

export const productionMetrics = pgTable("production_metrics", {
	metricId: serial("metric_id").primaryKey().notNull(),
	orderId: integer("order_id"),
	machineUtilization: numeric("machine_utilization", { precision: 5, scale:  2 }),
	defectRate: numeric("defect_rate", { precision: 5, scale:  2 }),
	productionRate: integer("production_rate"),
	recordedAt: timestamp("recorded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxProductionMetricsRecordedAt: index("idx_production_metrics_recorded_at").using("btree", table.recordedAt.asc().nullsLast()),
		productionMetricsOrderIdFkey: foreignKey({
			columns: [table.orderId],
			foreignColumns: [productionOrders.orderId],
			name: "production_metrics_order_id_fkey"
		}),
	}
});

export const qualityInspections = pgTable("quality_inspections", {
	inspectionId: serial("inspection_id").primaryKey().notNull(),
	orderId: integer("order_id"),
	inspectorName: varchar("inspector_name", { length: 100 }),
	status: varchar({ length: 20 }),
	defectsFound: integer("defects_found").default(0),
	notes: text(),
	inspectionDate: timestamp("inspection_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxQualityInspectionsDate: index("idx_quality_inspections_date").using("btree", table.inspectionDate.asc().nullsLast()),
		qualityInspectionsOrderIdFkey: foreignKey({
			columns: [table.orderId],
			foreignColumns: [productionOrders.orderId],
			name: "quality_inspections_order_id_fkey"
		}),
		qualityInspectionsStatusCheck: check("quality_inspections_status_check", sql`(status)::text = ANY ((ARRAY['scheduled'::character varying, 'in_progress'::character varying, 'completed'::character varying])::text[])`),
	}
});

import { pgTable, uuid, varchar, text, numeric, timestamp, foreignKey, check, integer, date } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const rawMaterials = pgTable("raw_materials", {
	materialId: uuid("material_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	materialName: varchar("material_name", { length: 100 }).notNull(),
	description: text(),
	unitOfMeasure: varchar("unit_of_measure", { length: 20 }).notNull(),
	currentStock: numeric("current_stock", { precision: 10, scale:  2 }).default('0'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const products = pgTable("products", {
	productId: uuid("product_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	productName: varchar("product_name", { length: 100 }).notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const productionOrders = pgTable("production_orders", {
	orderId: uuid("order_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	productId: uuid("product_id"),
	orderQuantity: integer("order_quantity").notNull(),
	plannedStartDate: timestamp("planned_start_date", { mode: 'string' }).notNull(),
	plannedEndDate: timestamp("planned_end_date", { mode: 'string' }).notNull(),
	actualStartDate: timestamp("actual_start_date", { mode: 'string' }),
	actualEndDate: timestamp("actual_end_date", { mode: 'string' }),
	status: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		productionOrdersProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "production_orders_product_id_fkey"
		}),
		productionOrdersStatusCheck: check("production_orders_status_check", sql`(status)::text = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])`),
	}
});

export const productionTracking = pgTable("production_tracking", {
	trackingId: uuid("tracking_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	orderId: uuid("order_id"),
	quantityProduced: integer("quantity_produced").default(0).notNull(),
	quantityDefective: integer("quantity_defective").default(0).notNull(),
	productionDate: date("production_date").notNull(),
	shift: varchar({ length: 20 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		productionTrackingOrderIdFkey: foreignKey({
			columns: [table.orderId],
			foreignColumns: [productionOrders.orderId],
			name: "production_tracking_order_id_fkey"
		}),
	}
});

export const machines = pgTable("machines", {
	machineId: uuid("machine_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	machineName: varchar("machine_name", { length: 100 }).notNull(),
	machineType: varchar("machine_type", { length: 50 }).notNull(),
	status: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		machinesStatusCheck: check("machines_status_check", sql`(status)::text = ANY ((ARRAY['idle'::character varying, 'running'::character varying, 'maintenance'::character varying, 'breakdown'::character varying])::text[])`),
	}
});

export const machineUtilization = pgTable("machine_utilization", {
	utilizationId: uuid("utilization_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	machineId: uuid("machine_id"),
	orderId: uuid("order_id"),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	status: varchar({ length: 20 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		machineUtilizationMachineIdFkey: foreignKey({
			columns: [table.machineId],
			foreignColumns: [machines.machineId],
			name: "machine_utilization_machine_id_fkey"
		}),
		machineUtilizationOrderIdFkey: foreignKey({
			columns: [table.orderId],
			foreignColumns: [productionOrders.orderId],
			name: "machine_utilization_order_id_fkey"
		}),
		machineUtilizationStatusCheck: check("machine_utilization_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'idle'::character varying, 'maintenance'::character varying, 'breakdown'::character varying])::text[])`),
	}
});

export const qualityInspections = pgTable("quality_inspections", {
	inspectionId: uuid("inspection_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	orderId: uuid("order_id"),
	inspectorName: varchar("inspector_name", { length: 100 }).notNull(),
	inspectionDate: timestamp("inspection_date", { mode: 'string' }).notNull(),
	status: varchar({ length: 20 }),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		qualityInspectionsOrderIdFkey: foreignKey({
			columns: [table.orderId],
			foreignColumns: [productionOrders.orderId],
			name: "quality_inspections_order_id_fkey"
		}),
		qualityInspectionsStatusCheck: check("quality_inspections_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'passed'::character varying, 'failed'::character varying])::text[])`),
	}
});

export const qualityDefects = pgTable("quality_defects", {
	defectId: uuid("defect_id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	inspectionId: uuid("inspection_id"),
	defectType: varchar("defect_type", { length: 50 }).notNull(),
	severity: varchar({ length: 20 }),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		qualityDefectsInspectionIdFkey: foreignKey({
			columns: [table.inspectionId],
			foreignColumns: [qualityInspections.inspectionId],
			name: "quality_defects_inspection_id_fkey"
		}),
		qualityDefectsSeverityCheck: check("quality_defects_severity_check", sql`(severity)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[])`),
	}
});

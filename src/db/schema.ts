import { pgTable, foreignKey, serial, integer, varchar, numeric, boolean, text, timestamp, json, index, check, date, pgView, bigint, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const inspectionStatus = pgEnum("inspection_status", ['scheduled', 'in_progress', 'completed', 'failed'])
export const productionStatus = pgEnum("production_status", ['pending', 'in_progress', 'completed', 'halted'])



export const qualityMetrics = pgTable("quality_metrics", {
	id: serial().primaryKey().notNull(),
	inspectionId: integer("inspection_id"),
	metricName: varchar("metric_name", { length: 100 }).notNull(),
	expectedValue: numeric("expected_value", { precision: 10, scale:  2 }),
	actualValue: numeric("actual_value", { precision: 10, scale:  2 }),
	isPassed: boolean("is_passed"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		qualityMetricsInspectionIdFkey: foreignKey({
			columns: [table.inspectionId],
			foreignColumns: [qualityInspections.id],
			name: "quality_metrics_inspection_id_fkey"
		}),
	}
});

export const materialUsage = pgTable("material_usage", {
	id: serial().primaryKey().notNull(),
	productionOrderId: integer("production_order_id"),
	rawMaterialId: integer("raw_material_id"),
	quantityUsed: numeric("quantity_used", { precision: 10, scale:  2 }),
	usageDate: timestamp("usage_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		materialUsageProductionOrderIdFkey: foreignKey({
			columns: [table.productionOrderId],
			foreignColumns: [productionOrders.id],
			name: "material_usage_production_order_id_fkey"
		}),
		materialUsageRawMaterialIdFkey: foreignKey({
			columns: [table.rawMaterialId],
			foreignColumns: [rawMaterials.id],
			name: "material_usage_raw_material_id_fkey"
		}),
	}
});

export const rawMaterials = pgTable("raw_materials", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	unitOfMeasure: varchar("unit_of_measure", { length: 20 }),
	currentStock: numeric("current_stock", { precision: 10, scale:  2 }),
	minimumStock: numeric("minimum_stock", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const products = pgTable("products", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	specifications: json(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const productionOrders = pgTable("production_orders", {
	id: serial().primaryKey().notNull(),
	productId: integer("product_id"),
	quantityOrdered: integer("quantity_ordered").notNull(),
	quantityProduced: integer("quantity_produced").default(0),
	startDate: timestamp("start_date", { mode: 'string' }),
	endDate: timestamp("end_date", { mode: 'string' }),
	status: productionStatus().default('pending'),
	priority: integer().default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxProductionOrdersStatus: index("idx_production_orders_status").using("btree", table.status.asc().nullsLast()),
		productionOrdersProductIdFkey: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "production_orders_product_id_fkey"
		}),
	}
});

export const productionSteps = pgTable("production_steps", {
	id: serial().primaryKey().notNull(),
	productionOrderId: integer("production_order_id"),
	machineId: integer("machine_id"),
	stepNumber: integer("step_number").notNull(),
	description: text(),
	startTime: timestamp("start_time", { mode: 'string' }),
	endTime: timestamp("end_time", { mode: 'string' }),
	status: productionStatus().default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxProductionStepsStatus: index("idx_production_steps_status").using("btree", table.status.asc().nullsLast()),
		productionStepsProductionOrderIdFkey: foreignKey({
			columns: [table.productionOrderId],
			foreignColumns: [productionOrders.id],
			name: "production_steps_production_order_id_fkey"
		}),
		productionStepsMachineIdFkey: foreignKey({
			columns: [table.machineId],
			foreignColumns: [machines.id],
			name: "production_steps_machine_id_fkey"
		}),
	}
});

export const machines = pgTable("machines", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	status: varchar({ length: 50 }),
	maintenanceSchedule: json("maintenance_schedule"),
	lastMaintenanceDate: timestamp("last_maintenance_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const qualityInspections = pgTable("quality_inspections", {
	id: serial().primaryKey().notNull(),
	productionOrderId: integer("production_order_id"),
	inspectorName: varchar("inspector_name", { length: 100 }),
	inspectionDate: timestamp("inspection_date", { mode: 'string' }),
	status: inspectionStatus().default('scheduled'),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxQualityInspectionsStatus: index("idx_quality_inspections_status").using("btree", table.status.asc().nullsLast()),
		qualityInspectionsProductionOrderIdFkey: foreignKey({
			columns: [table.productionOrderId],
			foreignColumns: [productionOrders.id],
			name: "quality_inspections_production_order_id_fkey"
		}),
	}
});

export const defects = pgTable("defects", {
	id: serial().primaryKey().notNull(),
	inspectionId: integer("inspection_id"),
	defectType: varchar("defect_type", { length: 100 }),
	severity: integer(),
	description: text(),
	correctiveAction: text("corrective_action"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		defectsInspectionIdFkey: foreignKey({
			columns: [table.inspectionId],
			foreignColumns: [qualityInspections.id],
			name: "defects_inspection_id_fkey"
		}),
		defectsSeverityCheck: check("defects_severity_check", sql`(severity >= 1) AND (severity <= 5)`),
	}
});

export const productionMetrics = pgTable("production_metrics", {
	id: serial().primaryKey().notNull(),
	date: date().notNull(),
	productionOrderId: integer("production_order_id"),
	machineId: integer("machine_id"),
	shift: varchar({ length: 20 }),
	plannedProductionTime: integer("planned_production_time"),
	actualProductionTime: integer("actual_production_time"),
	totalPiecesProduced: integer("total_pieces_produced"),
	goodPieces: integer("good_pieces"),
	defectivePieces: integer("defective_pieces"),
	downtimeMinutes: integer("downtime_minutes"),
	setupTimeMinutes: integer("setup_time_minutes"),
	maintenanceTimeMinutes: integer("maintenance_time_minutes"),
	defectRate: numeric("defect_rate", { precision: 5, scale:  2 }),
	machineUtilization: numeric("machine_utilization", { precision: 5, scale:  2 }),
	oee: numeric({ precision: 5, scale:  2 }),
	efficiencyRate: numeric("efficiency_rate", { precision: 5, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxProductionMetricsDate: index("idx_production_metrics_date").using("btree", table.date.asc().nullsLast()),
		idxProductionMetricsMachine: index("idx_production_metrics_machine").using("btree", table.machineId.asc().nullsLast()),
		idxProductionMetricsOrder: index("idx_production_metrics_order").using("btree", table.productionOrderId.asc().nullsLast()),
		productionMetricsProductionOrderIdFkey: foreignKey({
			columns: [table.productionOrderId],
			foreignColumns: [productionOrders.id],
			name: "production_metrics_production_order_id_fkey"
		}),
		productionMetricsMachineIdFkey: foreignKey({
			columns: [table.machineId],
			foreignColumns: [machines.id],
			name: "production_metrics_machine_id_fkey"
		}),
	}
});

export const machineMetrics = pgTable("machine_metrics", {
	id: serial().primaryKey().notNull(),
	machineId: integer("machine_id"),
	date: date().notNull(),
	runtimeMinutes: integer("runtime_minutes"),
	downtimeMinutes: integer("downtime_minutes"),
	maintenanceMinutes: integer("maintenance_minutes"),
	powerConsumption: numeric("power_consumption", { precision: 10, scale:  2 }),
	temperature: numeric({ precision: 5, scale:  2 }),
	vibrationLevel: numeric("vibration_level", { precision: 5, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
},
(table) => {
	return {
		idxMachineMetricsDate: index("idx_machine_metrics_date").using("btree", table.date.asc().nullsLast()),
		idxMachineMetricsMachine: index("idx_machine_metrics_machine").using("btree", table.machineId.asc().nullsLast()),
		machineMetricsMachineIdFkey: foreignKey({
			columns: [table.machineId],
			foreignColumns: [machines.id],
			name: "machine_metrics_machine_id_fkey"
		}),
	}
});
export const dashboardSummary = pgView("dashboard_summary", {	date: date(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalOrders: bigint("total_orders", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalProduction: bigint("total_production", { mode: "number" }),
	avgDefectRate: numeric("avg_defect_rate"),
	avgMachineUtilization: numeric("avg_machine_utilization"),
	avgOee: numeric("avg_oee"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalDowntime: bigint("total_downtime", { mode: "number" }),
}).as(sql`SELECT date, count(DISTINCT production_order_id) AS total_orders, sum(total_pieces_produced) AS total_production, avg(defect_rate) AS avg_defect_rate, avg(machine_utilization) AS avg_machine_utilization, avg(oee) AS avg_oee, sum(downtime_minutes) AS total_downtime FROM production_metrics pm GROUP BY date ORDER BY date DESC`);
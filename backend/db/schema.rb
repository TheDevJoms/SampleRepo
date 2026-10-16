# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the Rails schema dumper, which will
# regenerate it from the current schema definition.

ActiveRecord::Schema[7.1].define(version: 2026_10_17_000003) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "machines", force: :cascade do |t|
    t.string "name", null: false
    t.string "serial_number", null: false
    t.string "model", null: false
    t.string "location", null: false
    t.string "status", default: "operational", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["serial_number"], name: "index_machines_on_serial_number", unique: true
  end

  create_table "supplies", force: :cascade do |t|
    t.string "name", null: false
    t.integer "quantity", default: 0, null: false
    t.string "unit", default: "pcs", null: false
    t.integer "reorder_level", default: 0, null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "username", null: false
    t.string "password_digest", null: false
    t.string "role", default: "staff", null: false
    t.string "status", default: "active", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["username"], name: "index_users_on_username", unique: true
  end
end

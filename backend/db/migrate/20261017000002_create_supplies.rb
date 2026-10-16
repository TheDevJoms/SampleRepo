class CreateSupplies < ActiveRecord::Migration[7.1]
  def change
    create_table :supplies do |t|
      t.string :name, null: false
      t.integer :quantity, null: false, default: 0
      t.string :unit, null: false, default: "pcs"
      t.integer :reorder_level, null: false, default: 0
      t.string :status, null: false, default: "active"

      t.timestamps
    end
  end
end

class CreateMachines < ActiveRecord::Migration[7.1]
  def change
    create_table :machines do |t|
      t.string :name, null: false
      t.string :serial_number, null: false
      t.string :model, null: false
      t.string :location, null: false
      t.string :status, null: false, default: "operational"

      t.timestamps
    end

    add_index :machines, :serial_number, unique: true
  end
end

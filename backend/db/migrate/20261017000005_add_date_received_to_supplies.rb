class AddDateReceivedToSupplies < ActiveRecord::Migration[8.0]
  def change
    add_column :supplies, :date_received, :date

    reversible do |dir|
      dir.up do
        Supply.reset_column_information
        Supply.where(date_received: nil).update_all(date_received: Date.current)
      end
    end
  end
end

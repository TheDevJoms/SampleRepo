class AddUidToTables < ActiveRecord::Migration[7.1]
  def up
    %i[users supplies machines].each do |table_name|
      unless column_exists?(table_name, :uid)
        add_column table_name, :uid, :string
      end

      unless index_exists?(table_name, :uid)
        add_index table_name, :uid, unique: true
      end
    end

    %i[users supplies machines].each do |table_name|
      model = table_name.to_s.classify.constantize
      model.reset_column_information

      model.find_each do |record|
        record.update_columns(uid: SecureRandom.uuid) if record.uid.blank?
      end

      change_column_null table_name, :uid, false
    end
  end

  def down
    %i[users supplies machines].each do |table_name|
      if index_exists?(table_name, :uid)
        remove_index table_name, :uid
      end

      remove_column table_name, :uid if column_exists?(table_name, :uid)
    end
  end
end

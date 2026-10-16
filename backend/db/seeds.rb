User.find_or_create_by!(username: "admin") do |user|
  user.password = "password"
  user.password_confirmation = "password"
  user.role = "admin"
  user.status = "active"
end

Supply.find_or_create_by!(name: "Steel Rod") do |supply|
  supply.quantity = 120
  supply.unit = "pcs"
  supply.reorder_level = 25
  supply.status = "active"
end

Supply.find_or_create_by!(name: "Hydraulic Oil") do |supply|
  supply.quantity = 34
  supply.unit = "liters"
  supply.reorder_level = 10
  supply.status = "low_stock"
end

Machine.find_or_create_by!(serial_number: "CNC-001") do |machine|
  machine.name = "CNC-01"
  machine.model = "M2000"
  machine.location = "Floor A"
  machine.status = "operational"
end

Machine.find_or_create_by!(serial_number: "LASER-002") do |machine|
  machine.name = "Laser-02"
  machine.model = "L300"
  machine.location = "Floor B"
  machine.status = "maintenance"
end

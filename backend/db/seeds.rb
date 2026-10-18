User.find_or_create_by!(username: "admin") do |user|
  user.password = "password"
  user.password_confirmation = "password"
  user.role = "admin"
  user.status = "active"
end

User.find_or_create_by!(username: "staff") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
  user.role = "staff"
  user.status = "active"
end

Supply.find_or_create_by!(name: "Steel Rod") do |supply|
  supply.quantity = 120
  supply.unit = "pieces"
  supply.reorder_level = 25
  supply.date_received = 12.days.ago.to_date
  supply.status = "active"
end

Supply.find_or_create_by!(name: "Hydraulic Oil") do |supply|
  supply.quantity = 34
  supply.unit = "liters"
  supply.reorder_level = 10
  supply.date_received = 4.days.ago.to_date
  supply.status = "low_stock"
end

Supply.find_or_create_by!(name: "Industrial Seal") do |supply|
  supply.quantity = 18
  supply.unit = "boxes"
  supply.reorder_level = 20
  supply.date_received = 2.days.ago.to_date
  supply.status = "low_stock"
end

Supply.find_or_create_by!(name: "Safety Gloves") do |supply|
  supply.quantity = 75
  supply.unit = "boxes"
  supply.reorder_level = 30
  supply.date_received = 8.days.ago.to_date
  supply.status = "active"
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

Machine.find_or_create_by!(serial_number: "PRESS-003") do |machine|
  machine.name = "Press-03"
  machine.model = "P450"
  machine.location = "Floor C"
  machine.status = "operational"
end

Machine.find_or_create_by!(serial_number: "CUTTER-004") do |machine|
  machine.name = "Cutter-04"
  machine.model = "X900"
  machine.location = "Floor D"
  machine.status = "retired"
end

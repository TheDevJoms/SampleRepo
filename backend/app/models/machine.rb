class Machine < ApplicationRecord
  validates :name, presence: true, length: { maximum: 100 }
  validates :serial_number, presence: true, uniqueness: true, length: { maximum: 80 }
  validates :model, presence: true, length: { maximum: 80 }
  validates :location, presence: true, length: { maximum: 120 }
  validates :status, presence: true, inclusion: { in: %w[operational maintenance retired] }
end

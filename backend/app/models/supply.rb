class Supply < ApplicationRecord
  validates :name, presence: true, length: { maximum: 100 }
  validates :quantity, :reorder_level, numericality: { greater_than_or_equal_to: 0 }
  validates :unit, presence: true, length: { maximum: 20 }
  validates :status, presence: true, inclusion: { in: %w[active low_stock discontinued] }
end

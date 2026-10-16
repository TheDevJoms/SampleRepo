class Supply < ApplicationRecord
  self.primary_key = :uid

  before_validation :generate_uid, on: :create

  validates :uid, presence: true, uniqueness: true
  validates :name, presence: true, length: { maximum: 100 }
  validates :quantity, :reorder_level, numericality: { greater_than_or_equal_to: 0 }
  validates :unit, presence: true, length: { maximum: 20 }
  validates :date_received, presence: true
  validates :status, presence: true, inclusion: { in: %w[active low_stock discontinued] }

  private

  def generate_uid
    self.uid ||= SecureRandom.uuid
  end
end

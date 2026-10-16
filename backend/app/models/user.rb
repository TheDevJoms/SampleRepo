class User < ApplicationRecord
  self.primary_key = :uid

  has_secure_password

  before_validation :generate_uid, on: :create

  validates :uid, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 30 }
  validates :password, length: { minimum: 6 }, if: ->(user) { user.password.present? }
  validates :role, presence: true, inclusion: { in: %w[admin staff] }
  validates :status, presence: true, inclusion: { in: %w[active inactive suspended] }

  private

  def generate_uid
    self.uid ||= SecureRandom.uuid
  end
end

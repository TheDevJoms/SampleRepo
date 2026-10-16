class User < ApplicationRecord
  has_secure_password

  validates :username, presence: true, uniqueness: true, length: { minimum: 3, maximum: 30 }
  validates :password, length: { minimum: 6 }, if: ->(user) { user.password.present? }
  validates :role, presence: true, inclusion: { in: %w[admin staff] }
  validates :status, presence: true, inclusion: { in: %w[active inactive suspended] }
end

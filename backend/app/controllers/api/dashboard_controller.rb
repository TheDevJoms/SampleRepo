module Api
  class DashboardController < ApplicationController
    def index
      render json: {
        users: User.count,
        supplies: Supply.count,
        machines: Machine.count,
        supplies_list: Supply.order(created_at: :desc).limit(10),
        machines_list: Machine.order(created_at: :desc).limit(10),
      }
    end
  end
end

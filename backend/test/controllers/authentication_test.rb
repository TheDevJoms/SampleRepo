require "test_helper"

class AuthenticationTest < ActionDispatch::IntegrationTest
  test "dashboard requires authentication" do
    get "/api/dashboard"

    assert_response :unauthorized
  end

  test "staff user cannot create a user" do
    staff = User.create!(username: "staffuser", password: "password123", role: "staff", status: "active")

    post "/api/users",
         params: {
           user: {
             username: "newuser",
             password: "password123",
             role: "staff",
             status: "active"
           }
         },
         headers: { "Authorization" => "Bearer #{staff.username}" }

    assert_response :forbidden
  end
end

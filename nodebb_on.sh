# Make necessary folders
mkdir -p .docker/public/uploads .docker/database/mongo/data .docker/config .docker/build .docker/database/redis .docker/database/postgresql/data

# Start nodebb
sudo docker compose --profile mongo up
echo "NodeBB is running at http://localhost:4567"
echo "Admin account: admin - Admin123!"

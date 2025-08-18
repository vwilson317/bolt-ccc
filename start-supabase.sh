#!/bin/bash

# Supabase Docker Compose Management Script

echo "🚀 Starting Supabase Local Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Function to check if ports are in use
check_ports() {
    local ports=("5432" "3000" "9999" "4000" "5000" "9000" "54321" "54323" "8080" "54324")
    local in_use=()
    
    for port in "${ports[@]}"; do
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            in_use+=("$port")
        fi
    done
    
    if [ ${#in_use[@]} -gt 0 ]; then
        echo "⚠️  Warning: The following ports are already in use:"
        printf '   %s\n' "${in_use[@]}"
        echo "   This might cause conflicts with Supabase services."
        read -p "   Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to show service status
show_status() {
    echo "📊 Service Status:"
    docker-compose ps
    echo
    echo "🌐 Access Points:"
    echo "   Main API Gateway: http://localhost:54321"
    echo "   Supabase Studio:  http://localhost:54323"
    echo "   Database:         localhost:5432"
    echo "   Email Testing:    http://localhost:54324"
}

# Function to show logs
show_logs() {
    echo "📋 Recent logs:"
    docker-compose logs --tail=20
}

# Main script logic
case "${1:-start}" in
    "start")
        echo "🔍 Checking for port conflicts..."
        check_ports
        
        echo "📦 Pulling latest images..."
        docker-compose pull
        
        echo "🚀 Starting services..."
        docker-compose up -d
        
        echo "⏳ Waiting for services to be ready..."
        sleep 10
        
        show_status
        echo
        echo "✅ Supabase is starting up!"
        echo "   Check the status with: ./start-supabase.sh status"
        echo "   View logs with: ./start-supabase.sh logs"
        echo "   Stop services with: ./start-supabase.sh stop"
        ;;
    "stop")
        echo "🛑 Stopping Supabase services..."
        docker-compose down
        echo "✅ Services stopped."
        ;;
    "restart")
        echo "🔄 Restarting Supabase services..."
        docker-compose down
        docker-compose up -d
        echo "✅ Services restarted."
        show_status
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "logs-follow")
        echo "📋 Following logs (Ctrl+C to stop):"
        docker-compose logs -f
        ;;
    "reset")
        echo "🗑️  Resetting Supabase (this will delete all data)..."
        read -p "   Are you sure? This will delete all database data! (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            docker-compose up -d
            echo "✅ Supabase reset complete."
        else
            echo "❌ Reset cancelled."
        fi
        ;;
    "help")
        echo "Supabase Docker Compose Management Script"
        echo
        echo "Usage: ./start-supabase.sh [command]"
        echo
        echo "Commands:"
        echo "  start        Start all services (default)"
        echo "  stop         Stop all services"
        echo "  restart      Restart all services"
        echo "  status       Show service status and access points"
        echo "  logs         Show recent logs"
        echo "  logs-follow  Follow logs in real-time"
        echo "  reset        Reset all data and restart"
        echo "  help         Show this help message"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "   Use './start-supabase.sh help' for available commands."
        exit 1
        ;;
esac 
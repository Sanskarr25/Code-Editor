import docker

try:
    client = docker.from_env()
    print("Docker client connected successfully!")
    print(f"Docker version: {client.version()}")

    images = client.images.list()
    print(f"\nFound {len(images)} images:")
    for img in images:
        print(f"  - {img.tags}")

except Exception as e:
    print(f"Error: {e}")
    print("\nMake sure Docker Desktop is running!")

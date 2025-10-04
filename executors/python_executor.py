import docker
import tempfile
import os
import time
from typing import Dict

class PythonExecutor:
    def __init__(self):
        """Initialize Docker client and verify image exists"""
        try:
            # Connect to Docker daemon
            self.client = docker.from_env()
            self.image_name = "python-executor:latest"
            
            # Check if our image exists
            self._ensure_image_exists()
            
        except docker.errors.DockerException as e:
            raise Exception(f"Docker is not running or not accessible: {str(e)}")
    
    def _ensure_image_exists(self):
        """Verify the Docker image is built"""
        try:
            self.client.images.get(self.image_name)
            print(f"✓ Docker image '{self.image_name}' found")
        except docker.errors.ImageNotFound:
            raise Exception(
                f"Docker image '{self.image_name}' not found!\n"
                f"Please build it first:\n"
                f"docker build -t python-executor:latest -f Dockerfile.python ."
            )
    
    def execute(self, code: str, user_input: str = "", timeout: int = 10) -> Dict:
        """
        Execute Python code in isolated Docker container
        
        Args:
            code: Python code to execute
            user_input: Input to provide to stdin
            timeout: Maximum execution time in seconds
            
        Returns:
            Dictionary with output, error, execution_time, and status
        """
        result = {
            "output": "",
            "error": "",
            "execution_time": 0,
            "status": "success"
        }
        
        # Create temporary directory for code files
        with tempfile.TemporaryDirectory() as temp_dir:
            # File paths
            code_file = os.path.join(temp_dir, "user_code.py")
            input_file = os.path.join(temp_dir, "input.txt")
            
            # Write user's code to file
            with open(code_file, 'w', encoding='utf-8') as f:
                f.write(code)
            
            # Write input if provided
            if user_input:
                with open(input_file, 'w', encoding='utf-8') as f:
                    f.write(user_input)
            
            container = None
            try:
                start_time = time.time()
                
                # Prepare command to run in container
                if user_input:
                    command = "sh -c 'python3 /tmp/code/user_code.py < /tmp/code/input.txt'"
                else:
                    command = "python3 /tmp/code/user_code.py"
                
                # Create and start container
                container = self.client.containers.run(
                    self.image_name,
                    command=command,
                    volumes={
                        temp_dir: {
                            'bind': '/tmp/code',
                            'mode': 'ro'
                        }
                    },
                    detach=True,
                    remove=False,
                    mem_limit="128m",
                    memswap_limit="128m",
                    cpu_period=100000,
                    cpu_quota=50000,
                    network_mode="none",
                    user="coderunner",
                    working_dir="/tmp/code"
                )
                
                # Wait for container to finish
                exit_code = container.wait(timeout=timeout)
                
                # Calculate execution time
                result["execution_time"] = round(time.time() - start_time, 3)
                
                # Get output
                stdout = container.logs(stdout=True, stderr=False).decode('utf-8')
                result["output"] = stdout
                
                # Get errors
                stderr = container.logs(stdout=False, stderr=True).decode('utf-8')
                if stderr:
                    result["error"] = stderr
                    
                # Check exit code
                if exit_code['StatusCode'] != 0:
                    result["status"] = "error"
                
            except Exception as e:
                if "timeout" in str(e).lower():
                    result["status"] = "timeout"
                    result["error"] = f"Execution timed out after {timeout} seconds"
                    result["execution_time"] = timeout
                else:
                    result["status"] = "error"
                    result["error"] = f"Execution error: {str(e)}"
                    
            finally:
                if container:
                    try:
                        container.stop(timeout=1)
                        container.remove()
                    except:
                        pass
        
        return result
    
    def test_connection(self) -> bool:
        """Test if Docker is accessible and image exists"""
        try:
            self.client.ping()
            self.client.images.get(self.image_name)
            return True
        except:
            return False
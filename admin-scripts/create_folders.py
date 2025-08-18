#!/usr/bin/env python3
import os
import sys

def create_numbered_folders(num_folders, target_dir="."):
    """
    Create numbered folders from 1 to num_folders in the specified directory.
    Skip folders that already exist.
    """
    # Create target directory if it doesn't exist
    if not os.path.exists(target_dir):
        try:
            os.makedirs(target_dir)
            print(f"Created target directory: '{target_dir}'")
        except Exception as e:
            print(f"Error creating target directory '{target_dir}': {e}")
            return
    
    created_count = 0
    skipped_count = 0
    
    for i in range(1, num_folders + 1):
        folder_name = str(i)
        folder_path = os.path.join(target_dir, folder_name)
        
        if os.path.exists(folder_path):
            print(f"Folder '{folder_path}' already exists, skipping...")
            skipped_count += 1
        else:
            try:
                os.makedirs(folder_path)
                print(f"Created folder '{folder_path}'")
                created_count += 1
            except Exception as e:
                print(f"Error creating folder '{folder_path}': {e}")
    
    print(f"\nSummary:")
    print(f"Target directory: '{target_dir}'")
    print(f"Created: {created_count} folders")
    print(f"Skipped: {skipped_count} folders")

if __name__ == "__main__":
    if len(sys.argv) < 2 or len(sys.argv) > 3:
        print("Usage: python3 create_folders.py <number_of_folders> [target_directory]")
        print("Examples:")
        print("  python3 create_folders.py 10")
        print("  python3 create_folders.py 10 my_folders")
        print("  python3 create_folders.py 25 /path/to/directory")
        sys.exit(1)
    
    try:
        num_folders = int(sys.argv[1])
        if num_folders <= 0:
            print("Please provide a positive number of folders")
            sys.exit(1)
        
        # Use provided directory or default to current directory
        target_dir = sys.argv[2] if len(sys.argv) == 3 else "."
        
        create_numbered_folders(num_folders, target_dir)
        
    except ValueError:
        print("Please provide a valid number")
        sys.exit(1)

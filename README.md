# Mind Map Application

A modern mind mapping tool that helps you organize and visualize your thoughts, ideas, and documents. Built with React and ReactFlow, this application provides an intuitive interface for creating interactive mind maps.

## What it does

- Create and connect topics with different types of connections (arrows, dotted lines, etc.)
- Edit nodes directly and move them around freely
- Attach documents (PDF, TXT, MD, DOC) to any node
- Generate and download summaries of your mind map
- Navigate easily with zoom controls and minimap

To run: `npm install` then `npm run dev` and open http://localhost:5173

## Features

- **Interactive Node Management**
  - Create new topics with a single click
  - Edit node content directly
  - Drag and reposition nodes freely
  - Delete nodes with a simple click
  - Colorful nodes with automatic color assignment

- **Advanced Connections**
  - Multiple connection types:
    - Simple Arrow (→)
    - Bidirectional (↔)
    - Dotted Line (⋯→)
    - Thick Arrow (⇒)
    - Animated Flow (⇢)
  - Easy connection creation with drag-and-drop
  - Connection points visible on hover

- **Document Attachments**
  - Attach multiple file types:
    - PDF documents
    - Text files (.txt)
    - Markdown files (.md)
    - Word documents (.doc, .docx)
  - Preview and access attached documents
  - Organized document list per node

- **Navigation & Controls**
  - Zoom in/out functionality
  - Reset view option
  - Pan and navigate the canvas
  - Minimap for easy navigation
  - Responsive layout

- **Summary & Export**
  - Generate comprehensive mind map summaries
  - Download summaries as text files
  - Overview of nodes, connections, and documents

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rashmi-star/MindMap.git
   cd MindMap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Usage

1. **Creating Nodes**
   - Click "Add New Topic" to create a new node
   - Click on any node's text area to edit its content
   - Drag nodes to reposition them

2. **Making Connections**
   - Hover over a node to see connection points
   - Click and drag from one point to another node
   - Use the dropdown menu to select different connection styles

3. **Managing Documents**
   - Click the 📎 button to attach files to a node
   - Click on attached file names to open them
   - Supports PDF, TXT, MD, and DOC files

4. **Navigation**
   - Use 🔍+ and 🔍- buttons to zoom in/out
   - Click ⟲ to reset the view
   - Click and drag empty space to pan around
   - Use the minimap for quick navigation

5. **Generating Summaries**
   - Click "Generate Summary" to create an overview
   - Use the 💾 button to download the summary as a text file

## Technologies Used

- React
- ReactFlow
- TypeScript
- Vite
- CSS3

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

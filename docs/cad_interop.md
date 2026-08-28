# CAD Interoperability & Exchange Surfaces

This document outlines the extension points, runtimes, and native exchange formats for target CAD applications based on official documentation and community standards.

## 1. Vectorworks
*   **Plugin Language / Runtime:** Vectorworks supports plugin development via its **C++ SDK** and **Python** runtime (as well as the legacy VectorScript). Python is the modern standard for accessible scripting, utilizing the `vs` module to interact with the underlying application.
*   **Data Formats:** Supports structured data management natively. Plugins can manage objects (`.vsm` files) and read/write standard formats like JSON or XML via standard Python libraries.
*   **Exchange Surfaces:** Embedded Python, VectorScript, and the SDK.
*   **Citations:**
    *   Vectorworks Developer Portal: [https://developer.vectorworks.net/](https://developer.vectorworks.net/)
    *   Python Scripting: [https://developer.vectorworks.net/index.php/Python](https://developer.vectorworks.net/index.php/Python)

## 2. ConnectCAD (Vectorworks Add-on)
*   **Plugin Language / Runtime:** Operates within the Vectorworks environment, utilizing Vectorworks' standard C++ SDK or Python runtimes for scripting.
*   **Data Formats:** Devices and circuits are managed via specialized Vectorworks tools. For structured import/export, ConnectCAD heavily utilizes **CSV (via Vectorworks worksheets)** for exchanging project data (e.g., equipment lists, cable schedules) with external platforms like Jetbuilt. Settings are stored within the Vectorworks library hierarchy.
*   **Exchange Surfaces:** Device and circuit import/export primarily through CSV worksheets.
*   **Citations:**
    *   ConnectCAD Documentation: [https://app-help.vectorworks.net/](https://app-help.vectorworks.net/)

## 3. Revit (Autodesk)
*   **Plugin Language / Runtime:** Extending Revit and Dynamo for IFC workflows is primarily done via the **Revit API (.NET/C#)** or through **Python nodes** inside Dynamo.
*   **Data Formats:** Native support for **IFC** (Industry Foundation Classes) import and export. Programmatic access is handled via the `Autodesk.Revit.DB` namespace (e.g., classes like `IFCImportOptions`, `IFCExportOptions`, and `RevitLinkType`).
*   **Exchange Surfaces:** IFC export mapping, RevitLinkType for IFC imports, and Dynamo Python entry points.
*   **Citations:**
    *   Revit API Docs (IFC Classes): [https://apidocs.co/](https://apidocs.co/)
    *   Autodesk Revit IFC GitHub: [https://github.com/Autodesk/revit-ifc](https://github.com/Autodesk/revit-ifc)

## 4. SketchUp
*   **Plugin Language / Runtime:** Extensions and custom importers are built using the **SketchUp Ruby API** (for active SketchUp instances) or the **SketchUp C API** (for standalone reading/writing of `.skp` files).
*   **Data Formats:** Natively supports importing **COLLADA (.dae)**, `.skp`, `.3ds`, `.dwg`, and `.dxf`. Newer versions natively support **glTF/GLB**, while older versions rely on third-party Extension Warehouse plugins.
*   **Exchange Surfaces:** SketchUp Importer/Exporter C API interface and glTF/DAE import menus.
*   **Citations:**
    *   SketchUp Ruby API: [https://ruby.sketchup.com/](https://ruby.sketchup.com/)
    *   SketchUp Supported Formats: [https://help.sketchup.com/](https://help.sketchup.com/)

# biel-react

Ask AI chatbot for React applications.

## Prerequisites

Before proceeding, ensure you have:

- A [Biel.ai account](https://app.biel.ai/accounts/signup/).
- A [project](https://docs.biel.ai/#2-create-a-project) set up in your Biel.ai dashboard. 
- A React application with Node.js installed.

## Installation

1. Open your terminal or command prompt.
2. Navigate to your project's root directory:

    ```bash
    cd path/to/your/project
    ```

    Replace `path/to/your/project` with the actual path to your project directory.

3. Install Biel.ai by running:

    ```bash
    npm install biel-react
    ```

    > **INFO**: If you're using yarn, use `yarn add biel-react` instead.

1. In the main component where you want the chatbot to appear (commonly `src/App.js`), import and embed the Biel.ai button:

    ```jsx
    import React, { useEffect } from 'react';
    import { BielButton } from 'biel-react';
    import { defineCustomElements } from 'biel-search/loader';
    import 'biel-search/dist/biel-search/biel-search.css';

    function App() {
        
        useEffect(() => {
            if (typeof window !== 'undefined') {
            defineCustomElements(window);
            }
        }, []);

        return (
            <div className="App">
                {/* Other components and content */}
                <BielButton project="<YOUR_PROJECT_ID>" button-position="bottom-right" modal-position="bottom-right" button-style="light">Ask AI</BielButton>
            </div>
        );
    }

    export default App;
    ```

    Replace `<YOUR_PROJECT_ID>` with your project's ID from the Biel.ai dashboard.

5. After compiling your application, the chatbot should be visible and functional on your site.

## Configuration

For further customization and to explore additional features, refer to the [Configuration section](https://docs.biel.ai/category/configuration).

## Support

Need assistance? [Contact us](https://docs.biel.ai/support) for help.

## License

Copyright (c) 2024 Biel.ai

Licensed under the [MIT License](LICENSE.md).

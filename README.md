# Burden



## Table of Contents

- [About](#about)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)


## About

Simple extension to view the total unpacked size of your node dependencies in the current workspace.

![Preview](./assets/img/preview.png)

## Usage

1. Install
2. Open a folder with a `package.json` file
3. View unpacked size in the status bar
4. ???
5. Profit

At the moment there is no other functionality, however, you can send me ideas, or contribute yourself!



## How it works

It does nothing more than parse the requests received from the official npm registry.

  1. It sends requests to the npm registry
  2. Parses the responses
  3. Calculates the total unpacked size for each dependency
  4. Displays it on the status bar

To prevent misutilizing both client and server resources, it maintains a cache, to avoid sending unnecessary requests to the npm registry.
However, this cache is workspace specific, and not globally accessible.

You can view the source code on GitHub.



## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch<br>
  `git checkout -b feature/AmazingFeature`
3. Commit your Changes<br>
  `git commit -m 'Add some AmazingFeature'`
4. Push to the Branch<br>
  `git push origin feature/AmazingFeature`
5. <a href="https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request">Open a Pull Request</a>


## License

Distributed under the MIT License.
<br />
See <a href="LICENSE.md">`LICENSE`</a> for more information.


## Contact

:email: - [am@ayushm.dev](mailto:am@ayushm.dev)<br>
:basketball: - [Dribbble](https://dribbble.com/ayush)<br>
:globe_with_meridians: - [Website](https://ayushm.dev)

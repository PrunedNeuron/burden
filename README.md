# Burden
[![Build Status][pipelines]][pipelines-url]
[![Maintainability][code-climate]][code-climate-url]
![Technical debt][technical-debt]
![Snyk Vulnerabilities][snyk]


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="">
    <img src="assets/img/burden_logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Dependency Burden</h3>
</p>



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

Email - [am@ayushm.dev](mailto:am@ayushm.dev)<br>
Dribbble - [Dribbble](https://dribbble.com/ayush)<br>
Website - [Website](https://ayushm.dev)


<!-- Links -->
[pipelines]: https://dev.azure.com/prunedneuron/Burden/_apis/build/status/PrunedNeuron.burden?branchName=master
[pipelines-url]: https://dev.azure.com/prunedneuron/Burden/_build/latest?definitionId=1&branchName=master
[code-climate]: https://img.shields.io/codeclimate/maintainability/PrunedNeuron/burden
[code-climate-url]: https://codeclimate.com/github/PrunedNeuron/burden/maintainability
[snyk]: https://img.shields.io/snyk/vulnerabilities/github/PrunedNeuron/burden
[technical-debt]: https://img.shields.io/codeclimate/tech-debt/PrunedNeuron/burden
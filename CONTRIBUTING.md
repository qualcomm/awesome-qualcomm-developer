# Contributing to awesome-qualcomm-developer

Hi there! We’re thrilled that you’d like to contribute to this project.

## Contribution Types

There are two main contributions that we're accepting in this repo: new repo entries and general site fixes.

### Adding a new repo entry

For adding new repos, find the relevant platform file for your project (or add a new one) and add the JSON entry there. The current platform files are as follows:
- `data/repos-cloud.json`
- `data/repos-compute.json`
- `data/repos-iot.json`

Be sure to include all of the required details for your entry using the following example:

    {
        "name": "rubik-tflite",
        "link": "https://github.com/ramalamadingdong/rubik-tflite",
        "description": "Demonstrates how to use TFLite and QNN delegate with Rubik Pi",
        "author": "ramalamadingdong",
        "lastUpdated": "2025-07-01",
        "stars": 3,
        "language": "Python",
        "tags": [
            "tflite",
            "image transformation",
            "image processing",
            "machine learning",
            "ai hub"
        ],
        "platforms": [
            "Dragonwing IoT"
        ],
    }

### Site updates

For general fixes to the site structure (html, css, js) please provide as much detail as possible when submitting your PR, including details on what, why, and how your changes were tested.


## Branching Strategy

In general, contributors should develop on branches based off of `main` and pull requests should be made against `main`.

## Submitting a pull request

1. Please read our [code of conduct](CODE-OF-CONDUCT.md) and [license](LICENSE.txt).
1. [Fork](https://github.com/qualcomm/awesome-qualcomm-developer/fork) and clone the repository.

    ```bash
    git clone https://github.com/<username>/awesome-qualcomm-developer.git
    ``` 

1. Create a new branch based on `main`:

    ```bash 
    git checkout -b <my-branch-name> main
    ```

1. Create an upstream `remote` to make it easier to keep your branches up-to-date:

    ```bash
    git remote add upstream https://github.com/qualcomm/awesome-qualcomm-developer.git
    ```

1. Make your changes, add tests, and make sure the tests still pass.
1. Commit your changes using the [DCO](https://developercertificate.org/). You can attest to the DCO by commiting with the **-s** or **--signoff** options or manually adding the "Signed-off-by":

    ```bash
    git commit -s -m "Really useful commit message"`
    ```

1. After committing your changes on the topic branch, sync it with the upstream branch:

    ```bash
    git pull --rebase upstream main
    ```

1. Push to your fork.

    ```bash
    git push -u origin <my-branch-name>
    ```

    The `-u` is shorthand for `--set-upstream`. This will set up the tracking reference so subsequent runs of `git push` or `git pull` can omit the remote and branch.

1. [Submit a pull request](https://github.com/qualcomm/awesome-qualcomm-developer/pulls) from your branch to `main`.
1. Pat yourself on the back and wait for your pull request to be reviewed.

Here are a few things you can do that will increase the likelihood of your pull request to be accepted:

- For new repos, follow the existing structure and use the correct platform file (if your project supports multiple Qualcomm platforms, just pick one)
- For site fixes, please provide information on how it was tested
- Keep your change as focused as possible.
  If you want to make multiple independent changes, please consider submitting them as separate pull requests.
- Write a [good commit message](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).
- It's a good idea to arrange a discussion with other developers to ensure there is consensus on large features, architecture changes, and other core code changes. PR reviews will go much faster when there are no surprises.

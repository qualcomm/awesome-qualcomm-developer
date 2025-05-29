# List of workflows and actions
This folder contains workflows that are helpful for maintaining a smooth and secure development process. The workflows should be enabled for open-source projects.

Workflows:
1. `pr-dependency-check.yml` - This workflow will run on every pull request to check if the proposed code changes contain third-party dependencies (third-party library and/or third-party actions) with vulnerabilities. If the proposed changes introduce third-party dependencies that contain vulnerabilities with HIGH or above severity, the workflow execution will fail.
2. `quic-organization-repolinter.yml` - This workflow will on every push and pull request event check if the repository follows the organization's open-source repository standards. For example, the workflow will check if the repository contains CONTRIBUTING file.
3. `stale-issues.yaml` - This workflow will periodically run every 30 days to check for stalled issues and PRs. If the workflow detects any stalled issues and/or PRs, it will automatically leave just a comment to draw attention.

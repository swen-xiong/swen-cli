const path = require("path");
const fs = require("fs-extra");
const chalk = require("chalk");
const Inquirer = require("inquirer");
const ora = require("ora");
const api = require("./api/index");
const util = require("util");
const downloadGitRepo = require("download-git-repo");
const figlet = require("figlet");

const cwd = process.cwd();

// 默认 github username
const DEFAULT_GITHUB_USERNAME = "swen-xiong";

class Creator {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = {
      username: DEFAULT_GITHUB_USERNAME,
      ...options,
    };
  }

  async create() {
    const isOverwrite = await this.handleDirectory();
    if (!isOverwrite) return;
    this.getRepos();
  }

  // 处理是否有相同目录
  async handleDirectory() {
    const targetDirectory = path.join(cwd, this.projectName);
    // 如果目录中存在了需要创建的目录
    if (fs.existsSync(targetDirectory)) {
      if (this.options.force) {
        await fs.remove(targetDirectory);
      } else {
        const { isOverwrite } = await new Inquirer.prompt([
          {
            name: "isOverwrite",
            type: "list",
            message: "是否强制覆盖已存在的同名目录？",
            choices: [
              {
                name: "覆盖",
                value: true,
              },
              {
                name: "不覆盖",
                value: false,
              },
            ],
          },
        ]);

        if (isOverwrite) {
          await fs.remove(targetDirectory);
        } else {
          console.log(chalk.red.bold("不覆盖同名目录，终止创建。"));
          return false;
        }
      }
    }
    return true;
  }

  async getRepos() {
    const loading = ora("正在从 github 拉取模板信息...");
    loading.start();
    const { data: list } = await api.getRepoList(this.options.username);
    loading.succeed();
    // 筛选出 repo topic 包含 `template` 的项目
    const repos = list
      .filter((item) => item.topics.includes("template"))
      .map((item) => item.name);
    if (repos.length > 0) {
      const { choiceTemplateName } = await new Inquirer.prompt([
        {
          name: "choiceTemplateName",
          type: "list",
          message: "请选择模版",
          choices: repos,
        },
      ]);
      this.downloadTemplate(choiceTemplateName);
    } else {
      console.log(chalk.red.bold("🈚 未找到项目模板"));
      return;
    }
  }

  async downloadTemplate(choiceTemplateName) {
    const download = util.promisify(downloadGitRepo);
    const templateUrl = `${this.options.username}/${choiceTemplateName}`;
    const loading = ora("正在拉取模版...");
    loading.start();
    await download(templateUrl, path.join(cwd, this.projectName));
    loading.succeed();
    this.showTemplateHelp();
  }

  // 模版使用提示
  showTemplateHelp() {
    console.log(
      `\r\n${chalk.green('Successfully')} created project ${chalk.cyan(this.projectName)}`
    );
  }
}

module.exports = async (projectName, options) => {
  const creator = new Creator(projectName, options);
  creator.create();
};

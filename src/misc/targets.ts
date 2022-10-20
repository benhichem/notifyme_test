import fs from "fs"

// load sources from targets.json
export default class ScrappingTargets {
  static load (){
    const _ = fs.readFileSync("../targets.json")
    const targets = JSON.parse(_.toString())

    return targets
  }
}

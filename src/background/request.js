import axios from "axios";
import { NET_WORK_CONFIG } from "../constant/storageKey";
import { trimSpace } from "../utils/utils";
import "./api/axios";
import { getLocal } from "./localStorage";

function getNowUrl() {
  let localNetConfig = getLocal(NET_WORK_CONFIG)
  let url = ""
  if (localNetConfig) {
    localNetConfig = JSON.parse(localNetConfig)
    url = localNetConfig.currentUrl
  }
  return url
}

async function fetchGraphQL(operationsDoc, operationName, variables, url) {
  let fetchUrl = url || getNowUrl()
  return new Promise((resolve, reject) => {
    axios.post(
      fetchUrl,
      {
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      }, {
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
      },
    }
    ).then((response) => {
      resolve(response.data)
    })
      .catch(async (err) => {
        reject({ errors: err })
      })
  })
}
function getQueryName(gqlparams){
  let queryMatch = gqlparams.match(/query (\w+)(?=[(\s{])/)
  if (queryMatch && queryMatch[1]) {
    return queryMatch[1]
  } else {
    throw new Error('gql not valid')
  }
}

export async function startFetchMyQuery(gqlparams, variables= {},url) {
  let operationName = getQueryName(gqlparams)
  let result = await fetchGraphQL(
    gqlparams,
    operationName,
    variables,
    url
  ).catch(errors => errors);
  let { errors, data } = result
  if (result.errors) {
    let errMessage = ""
    if (Array.isArray(errors) && errors[0] && errors[0].message) {
      errMessage = errors[0].message
    } else if(errors&&errors.message){
      errMessage = errors.message
    }else {
      errMessage = JSON.stringify(errors)
    }
    return { error: errMessage }
  }
  return data

}
export async function startFetchMyMutation(operationName, gqlparams, variables = {}, url) {
  let result = await fetchGraphQL(
    gqlparams,
    operationName,
    variables,
    url
  ).catch(errors => errors);
  let { errors, data } = result
  if (result.errors) {
    let errMessage = ""
    if (Array.isArray(errors) && errors[0] && errors[0].message) {
      errMessage = errors[0].message
    } else {
      errMessage = JSON.stringify(errors)
    }
    return { error: errMessage }
  }
  return data
}


export async function commonFetch(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then((response) => {
      resolve(response.data)
    }).catch(error => {
      reject({ error: error })
    })
  })
}
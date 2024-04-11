if cjson == nil then
    cjson = require "cjson"
end


local HISTOGRAM_LOG_BASE = 1.5
local HISTOGRAM_MIN_LOG = -50
local HISTOGRAM_MAX_LOG = 50
local HISTOGRAM_BORDERS = {0}
for idx = -50, 50 do
    HISTOGRAM_BORDERS[idx+50+2] = 1.5 ^ idx
end

local HISTOGRAM_VALUES = {}
local HISTOGRAM_NAMES = {}
local NUMERIC_METRICS = {}
local TRANSFER_DELAY = 1.0


local function increment_dict_value(dict, key, value)
    if dict[key] == nil then
        dict[key] = value
    else
        dict[key] = dict[key] + value
    end
end


function increment_metric(name, value)
    if value == nil then
        ngx.log(ngx.ERR, "Trying to set nil value for metric " .. name)
    else
        increment_dict_value(NUMERIC_METRICS, name, value)
    end
end


function add_to_histogram(name, value)
    local offset = 0
    if value == nil then
        ngx.log(ngx.ERR, "Trying to add nil value to histogram for metric " .. name)
        return
    elseif value ~= 0 then
        offset = math.floor(math.max(HISTOGRAM_MIN_LOG - 1, math.min(HISTOGRAM_MAX_LOG, math.log(value) / math.log(HISTOGRAM_LOG_BASE))) - HISTOGRAM_MIN_LOG + 1) + 1
    end

    increment_dict_value(HISTOGRAM_VALUES, name .. offset, 1)
    HISTOGRAM_NAMES[name] = 1
end


local function yasmify_histogram(name)
    local hvalues = HISTOGRAM_VALUES
    local output = {}
    for idx = 1, #HISTOGRAM_BORDERS do
        local value = HISTOGRAM_VALUES[name .. idx]
        if value ~= nil then
            output[#output+1] = {HISTOGRAM_BORDERS[idx], value}
        end
    end
    return output
end

function get_yasm_metrics()
    local output = {}
    for key, val in pairs(NUMERIC_METRICS) do
        output[#output + 1] = { key, val }
    end

    for key, val in pairs(HISTOGRAM_NAMES) do
        local value = yasmify_histogram(key)
        output[#output + 1] = { key, value }
    end
    return output
end


local function split(str, sep)
    local splitted = {}
    for word in string.gmatch(str, "([^"..sep.."]+)") do
            table.insert(splitted, word)
    end
    return splitted
end

local function get_path(url)
    local index = url:find("?")
    if index then
        url = url:sub(0, index-1)
    end
    return url
end

local function replace_strange_symbols(str)
    return str:gsub("[= ')(?/_]+", "_")
end

function url_handler(url, max_depth)
    path = get_path(url)
    splitted_path = split(path, "/")
    stripped_path = table.concat(splitted_path, "/", 1, math.min(#splitted_path, max_depth))
    return replace_strange_symbols(stripped_path)
end

function status_to_category(code)
    if code >= 600 or code < 100 then
        return "strange_code"
    elseif code >= 500 then
        return "5xx"
    elseif code >= 400 then
        return "4xx"
    elseif code >= 300 then
        return "3xx"
    elseif code >= 200 then
        return "2xx"
    elseif code >= 100 then
        return "1xx"
    end
end

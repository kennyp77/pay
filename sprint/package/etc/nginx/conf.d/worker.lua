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
-- slightly greater than (1.5^-25) - histograms can not handle 0 timed requests
local MIN_REQUEST_TIME = 0.00003960213


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

function update_metrics(name, only)
-- if name is passed - update global and named metrics, if only is true, then update only named metrics without globals
    local status_class = math.floor(ngx.status / 100)
    local request_time = math.max(tonumber(ngx.var.request_time), MIN_REQUEST_TIME)

    if only ~= true then
        increment_metric(string.format("ctype=nginx;request_%dxx_count_summ", status_class), 1)
        increment_metric(string.format("ctype=nginx;request_%d_count_summ", ngx.status), 1)
        add_to_histogram(string.format("ctype=nginx;request_time_hgram"), request_time)
    end

    if name ~= nil then
        increment_metric(string.format("ctype=nginx;request_%dxx_count_%s_summ", status_class, name), 1)
        increment_metric(string.format("ctype=nginx;request_%d_count_%s_summ", ngx.status, name), 1)
        add_to_histogram(string.format("ctype=nginx;request_time_%s_hgram", name), request_time)
    end
end
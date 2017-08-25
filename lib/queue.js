
var queue = function queue() {
    
        var jobs          = [];
        var queueSettings = {
            timeout: 30000		
        };
        var triggers      = {
            init: [],
            add: [],
            jobCallback: [],
            run: [],
            timeout: []
        };
        var runningJob	 = false;
        var queueClass   = this;
    
        this.init = function init(settings) {
    
            if (settings !== undefined && typeof settings === 'object') {
                mergeSettings(settings);
            }
    
            emit('init', settings);
    
            return this;
        };
    
        this.add = function add(name, userFunction, params, timeout) {
            var newJob = {
                name: name,
                userFunction: (userFunction === undefined ? function() { } : userFunction),
                params: (params === undefined ? [] : params),
                timeout: (timeout === undefined ? 0 : timeout),
                status: 'added'
            };
    
            jobs.push(newJob);
    
            emit('add', newJob);
    
            return this;
        };
    
        var jobCallback = function jobCallback(job) {
    
            if (jobs.length === 0) {
                throw new Error('No jobs');
                return;
            }
    
            if (job === undefined && runningJob) {
                job = runningJob;
            }
    
            if (jobs[job] === undefined) {
                throw new Error('This job doenst exists');
                return;
            }
    
            jobs[job].status = 'completed';
    
            //Stop timer
            if (typeof jobs[job]['timer'] !== undefined) {
                clearTimeout(jobs[job]['timer']);
                delete jobs[job]['timer'];
            }
    
            emit('jobCallback', jobs[job]);
    
            runningJob = false;
    
            delete jobs[job];
    
            //Start next cron
            queueClass.run();
        };
    
        var emit = function emit(event, params) {
            if (triggers[event] === undefined ) {
                throw new Error('No valid event');
                return false;
            }
    
            var totalTriggers = triggers[event].length;
    
            if (totalTriggers === 0) {
                return false;
            }
    
            for(var i=0; i<triggers[event].length; ++i) {
                triggers[event][i](params);
            }
    
            return true;
        };
    
        this.on = function on(event, userFunction) {
            if (triggers[event] === undefined ) {
                throw new Error('No valid event');
            }
    
            if (userFunction === undefined || typeof userFunction !== 'function' ) {
                throw new Error('Callback function has to be an function');
            }
    
            if (event.indexOf(' ') !== -1) {
                var events = event.split(' ');
                for (var e in events) {
                    triggers[e].push(userFunction);
                }
            } else {
                triggers[event].push(userFunction);
            }
    
            return this;
        };
    
        this.run = function run() {
    
            if (runningJob) {
                return false;
            }
    
            if (jobs.length === 0) {
                console.log(jobs, 'no jobs');
                return false;
            }
    
            for (var job in jobs) {
    
                if (jobs[job].status === 'added') {
    
                    runningJob = job;
    
                    var jobParams = jobs[job].params;
    
                    jobParams.unshift(jobCallback, job);
    
                    if (jobs[job].timeout !== undefined && jobs[job].timeout > 0) {
    
                        jobs[job]['timer'] = setTimeout(function timerCallBack() {
                            jobs[job].status = 'timeout';
                            emit('timeout', jobs[job]);
                            runningJob = false;
                            queueClass.run();
                        }, jobs[job].timeout);
    
                    } else if (queueSettings.timeout !== undefined && queueSettings.timeout > 0) {
    
                        jobs[job]['timer'] = setTimeout(function timerCallBack() {
                            jobs[job].status = 'timeout';
                            emit('timeout', jobs[job]);
                            queueClass.run();
                            runningJob = false;
                        }, queueSettings.timeout);
                    }
    
                    emit('run', jobs[job]);
                    jobs[job].userFunction.apply(this, jobParams);
    
                    break;
                }
            }
        };
    
        this.clearTrigger = function clearTrigger(trigger) {
            if (triggers[trigger] !== undefined) {
                delete triggers[trigger];
            }
            return this;
        }
    
        this.clearTriggers = function clearTriggers() {
            for ( var trigger in triggers) {
                triggers[trigger] = [];
            }
            return this;
        }
    
        var mergeSettings = function mergeSettings(settings) {
            for(var setting in queueSettings) {
                if (settings[setting] !== undefined) {
                    queueSettings[setting] = settings[setting];
                }
            }
        }
    };
    
    module.exports = (new queue());
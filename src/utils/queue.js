class ConcurrentPoll {
  constructor({ max = 5, done }) {
    this.tasks = []; // 任务队列
    this.max = max; // 最大并发数
    this.total = 0;
    this.done = done;
    setTimeout(() => {
      // 函数主体执行完后立即执行
      this.run();
    }, 0);
  }

  addTask(task) {
    this.tasks.push(task);
    this.total += 1;
  }

  run() {
    // 原型任务运行方法
    if (this.tasks.length === 0) {
      // 判断是否还有任务
      return Promise.resolve('');
    }

    const min = Math.min(this.tasks.length, this.max); // 取任务个数与最大并发数最小值

    for (let i = 0; i < min; i += 1) {
      this.max -= 1; // 执行最大并发递减
      const task = this.tasks.shift(); // 从数组头部取任务
      task()
        .then(() => {
          // 重：此时可理解为，当for循环执行完毕后异步请求执行回调,此时max变为0
          // console.log('ok')
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          // 重：当所有请求完成并返回结果后，执行finally回调，此回调将按照for循环依次执行，此时max为0.
          this.max += 1; // 超过最大并发10以后的任务将按照任务顺序依次执行。此处可理解为递归操作。
          this.total -= 1;
          this.run();
          if (this.total === 0) {
            this.done?.();
          }
        });
    }
  }
}

module.exports = ConcurrentPoll;

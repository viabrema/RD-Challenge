
/**
 * Returns the most number of customers a CS has received in this distribution
 * @param {array} groupedCustomerSuccess  
 */

function getMostNumberCustomersByCustomerSuccess(groupedCustomerSuccess) {
  let result = 0;
  if (groupedCustomerSuccess.length) {
    result = groupedCustomerSuccess.reduce((acc, cur) => {
      return cur.totalCustomers > acc ? cur.totalCustomers : acc;
    }, groupedCustomerSuccess[0].totalCustomers);
  }
  return result;
}

/**
 * Returns an array with the distribution of customers by CSs
 * @param {array} customers 
 * @param {array} customerSuccessOrdered  
 */
function getCustomersDistribuition(customers, customerSuccessOrdered) {

  const customersDistribuition = [];

  customers.forEach((customer) => {
    const customerSuccessMatch = customerSuccessOrdered.find((item) => customer.score <= item.score);
    if (customerSuccessMatch) {
      customersDistribuition.push({ customerSuccessId: customerSuccessMatch.id, customersId: customer.id });
    }
  });
  return customersDistribuition;
}

/**
 * Returns a grouped array of CSs by number of customers served
 * @param {array} customersDistribuition 
 */
function groupCustomerSuccess(customersDistribuition) {

  const groupCustomerSuccess = [];

  customersDistribuition.forEach((distribuitionItem) => {
    const index = groupCustomerSuccess.findIndex(item => item.customerSuccessId === distribuitionItem.customerSuccessId);
    if (index === -1) {
      groupCustomerSuccess.push({ customerSuccessId: distribuitionItem.customerSuccessId, totalCustomers: 1 });
    } else {
      groupCustomerSuccess[index].totalCustomers += 1;
    }
  });

  return groupCustomerSuccess;
}


/**
 * Returns the id of the CustomerSuccess with the most customers
 * @param {array} customerSuccess
 * @param {array} customers
 * @param {array} customerSuccessAway
 */
function customerSuccessBalancing(
  customerSuccess,
  customers,
  customerSuccessAway
) {

  const customerSuccessAvailable = customerSuccess.filter((item) => !customerSuccessAway.includes(item.id));

  const customerSuccessAvailableByScore = customerSuccessAvailable.sort((csA, csB) => csA.score < csB.score ? -1 : csA.score > csB.score ? 1 : 0);

  const customersDistribuition = getCustomersDistribuition(customers, customerSuccessAvailableByScore);

  const groupedCustomerSuccess = groupCustomerSuccess(customersDistribuition);

  const maxNumberOfCustomers = getMostNumberCustomersByCustomerSuccess(groupedCustomerSuccess);

  const customerSuccessWithMostCustomers = groupedCustomerSuccess.filter(item => item.totalCustomers === maxNumberOfCustomers);

  return customerSuccessWithMostCustomers.length === 1? customerSuccessWithMostCustomers[0].customerSuccessId : 0;

}


test("Scenario 1", () => {
  const css = [
    { id: 1, score: 60 },
    { id: 2, score: 20 },
    { id: 3, score: 95 },
    { id: 4, score: 75 },
  ];
  const customers = [
    { id: 1, score: 90 },
    { id: 2, score: 20 },
    { id: 3, score: 70 },
    { id: 4, score: 40 },
    { id: 5, score: 60 },
    { id: 6, score: 10 },
  ];
  const csAway = [2, 4];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

function buildSizeEntities(size, score) {
  const result = [];
  for (let i = 0; i < size; i += 1) {
    result.push({ id: i + 1, score });
  }
  return result;
}

function mapEntities(arr) {
  return arr.map((item, index) => ({
    id: index + 1,
    score: item,
  }));
}

function arraySeq(count, startAt) {
  return Array.apply(0, Array(count)).map((it, index) => index + startAt);
}

test("Scenario 2", () => {
  const css = mapEntities([11, 21, 31, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 3", () => {
  const testTimeoutInMs = 100;
  const testStartTime = new Date().getTime();

  const css = mapEntities(arraySeq(999, 1));
  const customers = buildSizeEntities(10000, 998);
  const csAway = [999];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(998);

  if (new Date().getTime() - testStartTime > testTimeoutInMs) {
    throw new Error(`Test took longer than ${testTimeoutInMs}ms!`);
  }
});

test("Scenario 4", () => {
  const css = mapEntities([1, 2, 3, 4, 5, 6]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 5", () => {
  const css = mapEntities([100, 2, 3, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(1);
});

test("Scenario 6", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [1, 3, 2];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(0);
});

test("Scenario 7", () => {
  const css = mapEntities([100, 99, 88, 3, 4, 5]);
  const customers = mapEntities([10, 10, 10, 20, 20, 30, 30, 30, 20, 60]);
  const csAway = [4, 5, 6];

  expect(customerSuccessBalancing(css, customers, csAway)).toEqual(3);
});
